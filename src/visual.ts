"use strict";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { VisualSettings } from "./settings";

export class Visual implements IVisual {
    private target: HTMLElement;
    private container: HTMLElement;
    private host: powerbi.extensibility.visual.IVisualHost;
    private selectionManager: powerbi.extensibility.ISelectionManager;
    private selectedKeys: Set<string> = new Set();
    private formattingSettingsService: FormattingSettingsService;
    private settings: VisualSettings;
    private currentIndex: number = 0;
    private currentPage: number = 0;
    private userMode: string | null = null; // Override local do modo (null = usa settings)

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
        this.host = options.host;
        this.selectionManager = options.host.createSelectionManager();
        this.formattingSettingsService = new FormattingSettingsService();
        this.settings = new VisualSettings();
        this.container = document.createElement("div");
        this.container.style.width = "100%";
        this.container.style.height = "100%";
        this.target.appendChild(this.container);
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.settings);
    }

    public update(options: VisualUpdateOptions): void {
        const dataView = options.dataViews[0];
        if (!dataView) return;

        // Format Pane (moderno)
        this.settings = this.formattingSettingsService.populateFormattingSettingsModel(VisualSettings, dataView);

        const cfg = this.settings.config as any;
        const settings = {
            mode: (cfg.viewMode?.value?.value ?? cfg.viewMode?.value ?? "carousel") as string,
            showToggle: !!(cfg.showModeToggle?.value ?? true),
            pos: (cfg.textPosition?.value?.value ?? cfg.textPosition?.value ?? "top") as string,
            bg: (cfg.bgColor?.value?.value ?? "transparent") as string,
            tx: (cfg.txtColor?.value?.value ?? "#333") as string,
            size: (cfg.fontSize?.value ?? 14) as number,
            gridRows: (cfg.gridRows?.value ?? 2) as number,
            gridCols: (cfg.gridCols?.value ?? 3) as number
        };

        const effectiveMode = settings.showToggle && this.userMode ? this.userMode : settings.mode;
        const renderSettings = { ...settings, mode: effectiveMode };

        const data = this.readRows(dataView);

        this.render(data, renderSettings);
    }

    private clearElement(el: HTMLElement): void {
        while (el.firstChild) el.removeChild(el.firstChild);
    }

    private selectionKey(id: powerbi.extensibility.ISelectionId): string {
        const anyId = id as any;
        if (anyId && typeof anyId.getKey === "function") return String(anyId.getKey());
        if (anyId && typeof anyId.key === "string") return anyId.key;
        return String(anyId ?? "");
    }

    private readRows(dataView: powerbi.DataView): Array<{ url: string; title: string; sub1: string; sub2: string; selectionId?: powerbi.extensibility.ISelectionId }>
    {
        // Prefer table mapping (fixa o problema de texto por linha).
        const table = (dataView as any).table as powerbi.DataViewTable | undefined;
        if (table?.rows?.length && table?.columns?.length) {
            const colIndex = {
                url: table.columns.findIndex((c) => (c.roles as any)?.imageUrl),
                title: table.columns.findIndex((c) => (c.roles as any)?.title),
                sub1: table.columns.findIndex((c) => (c.roles as any)?.sub1),
                sub2: table.columns.findIndex((c) => (c.roles as any)?.sub2)
            };

            return table.rows
                .map((r, rowIndex) => {
                    const selectionId = this.host
                        .createSelectionIdBuilder()
                        .withTable(table, rowIndex)
                        .createSelectionId();

                    return {
                        url: String(colIndex.url >= 0 ? (r[colIndex.url] ?? "") : ""),
                        title: String(colIndex.title >= 0 ? (r[colIndex.title] ?? "") : ""),
                        sub1: String(colIndex.sub1 >= 0 ? (r[colIndex.sub1] ?? "") : ""),
                        sub2: String(colIndex.sub2 >= 0 ? (r[colIndex.sub2] ?? "") : ""),
                        selectionId
                    };
                })
                .filter((d) => d.url.trim().length > 0);
        }

        // Fallback: tenta categorical (compatibilidade)
        const cat = (dataView as any).categorical as powerbi.DataViewCategorical | undefined;
        const imageCat = cat?.categories?.[0]?.values || [];
        const values = cat?.values;
        const titles = values?.find((v) => (v.source.roles as any)?.title)?.values || [];
        const s1 = values?.find((v) => (v.source.roles as any)?.sub1)?.values || [];
        const s2 = values?.find((v) => (v.source.roles as any)?.sub2)?.values || [];

        return imageCat
            .map((v, i) => ({
                url: String(v ?? ""),
                title: String(titles[i] ?? ""),
                sub1: String(s1[i] ?? ""),
                sub2: String(s2[i] ?? "")
            }))
            .filter((d) => d.url.trim().length > 0);
    }

    private render(data: any[], s: any): void {
        this.clearElement(this.container);
        this.container.style.backgroundColor = s.bg;
        this.container.className = `main-container mode-${s.mode}`;

        this.container.onclick = (ev: MouseEvent) => {
            if (ev.defaultPrevented) return;
            void this.selectionManager.clear().then(() => {
                this.selectedKeys.clear();
                this.render(data, s);
            });
        };

        if (s.showToggle) {
            const toggleBar = this.createModeToggle(data, s);
            this.container.appendChild(toggleBar);
        }

        const safeGridRows = Math.max(1, Math.min(10, Number(s.gridRows) || 2));
        const safeGridCols = Math.max(1, Math.min(10, Number(s.gridCols) || 3));

        if (this.currentIndex >= data.length) this.currentIndex = 0;

        if (s.mode === "carousel") {
            this.currentPage = 0;
            const item = data[this.currentIndex];

            const wrapper = this.createCardElement(item, s);
            this.addSelectionIcon(wrapper, item, data, s);
            const nav = this.createCarouselNav(data.length, s, data);
            wrapper.appendChild(nav);
            this.container.appendChild(wrapper);
        } else {
            const pageSize = safeGridRows * safeGridCols;
            const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
            this.currentPage = Math.max(0, Math.min(this.currentPage, totalPages - 1));

            const grid = document.createElement("div");
            grid.className = "grid";
            grid.style.gridTemplateColumns = `repeat(${safeGridCols}, minmax(0, 1fr))`;
            grid.style.gridTemplateRows = `repeat(${safeGridRows}, minmax(0, 1fr))`;

            const start = this.currentPage * pageSize;
            const pageItems = data.slice(start, start + pageSize);
            pageItems.forEach((item) => {
                const div = document.createElement("div");
                div.className = "grid-item";
                const card = this.createCardElement(item, s);
                this.addSelectionIcon(card, item, data, s);
                div.appendChild(card);
                grid.appendChild(div);
            });
            this.container.appendChild(grid);

            if (totalPages > 1) {
                this.container.appendChild(this.createGridNav(totalPages, s, data));
            }
        }
    }

    private createCardElement(item: any, s: any): HTMLElement {
        const pos = String(s.pos || "top");
        const isOverlay = pos === "overlayTop" || pos === "overlayBottom";
        const isHidden = pos === "hidden";

        const wrapper = document.createElement("div");
        wrapper.className = `wrapper pos-${pos}`;

        const imgGroup = document.createElement("div");
        imgGroup.className = "img-group";
        const img = document.createElement("img");
        img.src = String(item.url ?? "");
        img.alt = String(item.title ?? "");
        (img as any).loading = "lazy";
        imgGroup.appendChild(img);

        let textGroup: HTMLElement | null = null;
        if (!isHidden) {
            textGroup = document.createElement("div");
            textGroup.className = "text-group";
            textGroup.style.color = String(s.tx);
            textGroup.style.fontSize = `${Number(s.size) || 14}px`;

            const title = document.createElement("div");
            title.className = "text-title";
            title.textContent = String(item.title ?? "");
            textGroup.appendChild(title);

            const subtitle = document.createElement("div");
            subtitle.className = "text-sub";
            const parts = [String(item.sub1 ?? "").trim(), String(item.sub2 ?? "").trim()].filter((x) => x);
            subtitle.textContent = parts.join(" | ");
            textGroup.appendChild(subtitle);
        }

        if (isHidden) {
            wrapper.appendChild(imgGroup);
            return wrapper;
        }

        if (isOverlay) {
            wrapper.appendChild(imgGroup);
            if (textGroup) wrapper.appendChild(textGroup);
            return wrapper;
        }

        // Para posições normais (não overlay), adiciona sempre textGroup primeiro, imgGroup depois
        // O CSS flex-direction controla a ordem visual
        if (textGroup) wrapper.appendChild(textGroup);
        wrapper.appendChild(imgGroup);
        return wrapper;
    }

    private addSelectionIcon(wrapper: HTMLElement, item: any, data: any[], s: any): void {
        if (!item?.selectionId) return;

        const icon = document.createElement("div");
        icon.className = "selection-icon";
        icon.title = "Filtrar por este item";
        icon.textContent = "◉";

        const key = this.selectionKey(item.selectionId);
        const isSelected = this.selectedKeys.has(key);
        icon.style.opacity = isSelected ? "1" : "0.4";
        if (isSelected) icon.classList.add("selected");

        icon.onclick = (ev: MouseEvent) => {
            ev.preventDefault();
            ev.stopPropagation();

            const multi = !!ev.ctrlKey || !!ev.metaKey;
            void this.selectionManager.select(item.selectionId, multi).then((ids) => {
                this.selectedKeys = new Set((ids || []).map((id) => this.selectionKey(id)));
                this.render(data, s);
            });
        };

        wrapper.appendChild(icon);

        if (this.selectedKeys.size > 0) {
            wrapper.style.opacity = isSelected ? "1" : "0.5";
        } else {
            wrapper.style.opacity = "1";
        }
    }

    private createCarouselNav(totalItems: number, s: any, data: any[]): HTMLElement {
        const navBar = document.createElement("div");
        navBar.className = "nav-bar";

        const prev = document.createElement("button");
        prev.textContent = "❮";
        const next = document.createElement("button");
        next.textContent = "❯";

        navBar.appendChild(prev);
        navBar.appendChild(next);

        prev.onclick = (ev: MouseEvent) => {
            ev.preventDefault();
            ev.stopPropagation();
            this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : Math.max(0, totalItems - 1);
            this.render(data, s);
        };
        next.onclick = (ev: MouseEvent) => {
            ev.preventDefault();
            ev.stopPropagation();
            this.currentIndex = this.currentIndex < totalItems - 1 ? this.currentIndex + 1 : 0;
            this.render(data, s);
        };

        const counter = document.createElement("div");
        counter.className = "counter";
        counter.style.color = String(s.tx);
        counter.textContent = `${this.currentIndex + 1}/${Math.max(1, totalItems)}`;

        const host = document.createElement("div");
        host.appendChild(navBar);
        host.appendChild(counter);
        return host;
    }

    private createGridNav(totalPages: number, s: any, data: any[]): HTMLElement {
        const nav = document.createElement("div");
        nav.className = "grid-nav";

        const prev = document.createElement("button");
        prev.className = "grid-prev";
        prev.textContent = "❮";

        const counter = document.createElement("div");
        counter.className = "grid-counter";
        counter.style.color = String(s.tx);
        counter.textContent = `${this.currentPage + 1}/${totalPages}`;

        const next = document.createElement("button");
        next.className = "grid-next";
        next.textContent = "❯";

        nav.appendChild(prev);
        nav.appendChild(counter);
        nav.appendChild(next);

        prev.onclick = (ev: MouseEvent) => {
            ev.preventDefault();
            ev.stopPropagation();
            this.currentPage = this.currentPage > 0 ? this.currentPage - 1 : totalPages - 1;
            this.render(data, s);
        };
        next.onclick = (ev: MouseEvent) => {
            ev.preventDefault();
            ev.stopPropagation();
            this.currentPage = this.currentPage < totalPages - 1 ? this.currentPage + 1 : 0;
            this.render(data, s);
        };

        return nav;
    }

    private createModeToggle(data: any[], s: any): HTMLElement {
        const bar = document.createElement("div");
        bar.className = "mode-toggle-bar";

        const carouselBtn = document.createElement("button");
        carouselBtn.className = "mode-btn";
        carouselBtn.textContent = "Carrossel";
        if (s.mode === "carousel") carouselBtn.classList.add("active");

        const gridBtn = document.createElement("button");
        gridBtn.className = "mode-btn";
        gridBtn.textContent = "Grid";
        if (s.mode === "grid") gridBtn.classList.add("active");

        bar.appendChild(carouselBtn);
        bar.appendChild(gridBtn);

        carouselBtn.onclick = (ev: MouseEvent) => {
            ev.preventDefault();
            ev.stopPropagation();
            this.userMode = "carousel";
            this.render(data, { ...s, mode: "carousel" });
        };

        gridBtn.onclick = (ev: MouseEvent) => {
            ev.preventDefault();
            ev.stopPropagation();
            this.userMode = "grid";
            this.render(data, { ...s, mode: "grid" });
        };

        return bar;
    }
}