export const THEME_COLORS = {
    primary: "#9E5FD3", // "#9E5FD3",
    primaryHover: "#b085d6",
    primaryLight: "#7BAEFF",
    success: "#0ecb81",
    danger: "#ff4a5c",
    info: "#627EEA",
    warning: "#ffb02c",
    white: "#fff",
    black: "#000",
    red: "#D93025",
    dark: "#2f2f2f",
    light: "#E6E6E6",

    // light
    title: "#000",
    text: "#000",
    description: "rgba(122, 122, 122, 1)",
    background: "#f5f5f5", //"#edeef0", // "#EFF3FA",
    backgroundSecond: "#F4F4F6",
    backgroundThird: "#f2f2f2",
    background4: "#f0f0f0",
    backgroundLight: "#f9f9f9",
    backgroundSemiTransparent: "rgba(255, 255, 255, 0.3)",
    card: "#fff",
    border: "rgba(0, 0, 0, 0.10)",
    input: "#EFF3FA",
    placeholder: "rgba(71,90,119,.5)",
    backgroundBtn: "#f5f5f5",
    backgroundDate: "#f3f1f7",
    backgroundChatMessageRight: "rgba(226, 245, 255, 0.8)",
    backgroundChatMessageLeft: "rgba(251, 249, 255, 0.8)",

    // dark
    darkTitle: "#fff",
    darkText: "rgba(255,255,255,.6)",
    darkBackground: "#070C1F",
    darkBackgroundLight: "#1e1e1e", // Очень тёмный серый (инверсия #f9f9f9)
    darkBackgroundSecond: "#252525", // Чуть светлее #1e1e1e (инверсия #F4F4F6)
    darkBackgroundThird: "#2a2a2a", // Средне-тёмный фон (инверсия #f2f2f2)
    darkBackground4: "#303030", // Чуть светлее #2a2a2a (инверсия #f0f0f0)
    darkBackgroundSemiTransparent: "rgba(0, 0, 0, 0.3)",
    darkCard: "#0D163D",
    darkBorder: "rgba(255,255,255,0.12)", // Светлая граница с низким контрастом
    darkInput: "rgba(255,255,255,.1)",
    darkPlaceholder: "rgba(255,255,255,.5)",
    darkBackgroundBtn: "#3a3a3a", // Темно-серый для кнопок (инверсия #f5f5f5)
    darkBackgroundDate: "#343434", // Чуть светлее кнопок, подходит для выделения дат
    darkBackgroundChatMessageRight: "rgba(50, 65, 80, 0.8)", // Тёмно-синий с прозрачностью
    darkBackgroundChatMessageLeft: "rgba(60, 60, 60, 0.8)", // Тёмно-серый с прозрачностью

    //text
    greyText: "#888",
    greyBtnText: "#333",
    dotColor: "rgba(255, 255, 255, 0.5)",

    darkGreyText: "#b0b0b0", // Светло-серый текст, хорошо читается на тёмном фоне (инверсия #888)
    darkGreyBtnText: "#d4d4d4", // Светло-серый, достаточно контрастный для кнопок (инверсия #333)
    darkDotColor: "rgba(200, 200, 200, 0.5)", // Мягкий светло-серый для точек, хорошо заметный на тёмном фоне
};


export const Theme = {
    colors: THEME_COLORS
};

export { inputHeight } from "./styles/commonFormStyles";


export const IMAGES = {
    google: require("../../assets/google.png"),
}