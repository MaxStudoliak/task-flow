/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    // Добавьте сюда другие переменные с префиксом VITE_, если они есть
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
