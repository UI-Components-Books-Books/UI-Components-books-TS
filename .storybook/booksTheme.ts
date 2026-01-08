import { create } from 'storybook/theming';

export default create({
    base: 'light',
    brandTitle: "Books UI 📘",
    brandUrl: 'https://github.com/UI-Components-Books-Books/UI-Components-books-TS',
    brandImage: '/logo.jpg',
    brandTarget: '_blank',
    colorPrimary: "#2f1c8f",
    colorSecondary: "#6024d9",
    
    // UI colors
    appBg: '#f6f9fc',
    appContentBg: '#ffffff',
    appBorderColor: '#e3e8ee',
    appBorderRadius: 8,
    
    // Text colors
    textColor: "#1a2233",
    textInverseColor: "rgba(255,255,255,0.9)",
    textMutedColor: "#787676",
    
    // Toolbar colors
    barTextColor: "#787676",
    barSelectedColor: "#6024d9",
    barBg: '#ffffff',
    
    // Form colors
    inputBg: '#ffffff',
    inputBorder: '#e3e8ee',
    inputTextColor: '#1a2233',
    inputBorderRadius: 4,
})