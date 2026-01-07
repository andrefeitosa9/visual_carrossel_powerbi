@echo off
REM Shim para ambientes sem PowerShell 7 (pwsh).
REM O pbiviz usa `pwsh` para gerar certificado; aqui encaminhamos para Windows PowerShell.
"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" %*
