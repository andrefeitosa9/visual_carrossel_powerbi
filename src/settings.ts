import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import powerbi from "powerbi-visuals-api";

type EnumMemberValue = powerbi.EnumMemberValue;

export class ConfigCard extends formattingSettings.SimpleCard {
    name = "config";
    displayName = "Layout e Estilo";

    viewMode = new formattingSettings.ItemDropdown({
        name: "viewMode",
        displayName: "Modo de Exibição",
        items: [
            { displayName: "Carrossel", value: "carousel" as EnumMemberValue },
            { displayName: "Grid", value: "grid" as EnumMemberValue }
        ],
        value: { displayName: "Carrossel", value: "carousel" as EnumMemberValue }
    });

    showModeToggle = new formattingSettings.ToggleSwitch({
        name: "showModeToggle",
        displayName: "Mostrar botão de alternância de modo",
        value: true
    });

    textPosition = new formattingSettings.ItemDropdown({
        name: "textPosition",
        displayName: "Posição do Texto",
        items: [
            { displayName: "Topo", value: "top" as EnumMemberValue },
            { displayName: "Base", value: "bottom" as EnumMemberValue },
            { displayName: "Esquerda", value: "left" as EnumMemberValue },
            { displayName: "Direita", value: "right" as EnumMemberValue },
            { displayName: "Sobreposto (Topo)", value: "overlayTop" as EnumMemberValue },
            { displayName: "Sobreposto (Base)", value: "overlayBottom" as EnumMemberValue },
            { displayName: "Oculto", value: "hidden" as EnumMemberValue }
        ],
        value: { displayName: "Topo", value: "top" as EnumMemberValue }
    });

    gridRows = new formattingSettings.NumUpDown({
        name: "gridRows",
        displayName: "Grid: linhas por página",
        value: 2
    });

    gridCols = new formattingSettings.NumUpDown({
        name: "gridCols",
        displayName: "Grid: colunas por página",
        value: 3
    });

    bgColor = new formattingSettings.ColorPicker({
        name: "bgColor",
        displayName: "Cor de Fundo",
        value: { value: "transparent" } as any
    });

    txtColor = new formattingSettings.ColorPicker({
        name: "txtColor",
        displayName: "Cor do Texto",
        value: { value: "#333333" } as any
    });

    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Tamanho da Fonte",
        value: 14
    });

    slices = [
        this.viewMode,
        this.showModeToggle,
        this.textPosition,
        this.gridRows,
        this.gridCols,
        this.bgColor,
        this.txtColor,
        this.fontSize
    ];
}

export class VisualSettings extends formattingSettings.Model {
    config = new ConfigCard();
    cards = [this.config];
}
