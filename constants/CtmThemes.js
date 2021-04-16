// creating theming that can be wrapped on components
import {configureFonts, DarkTheme, DefaultTheme} from "react-native-paper";

export const CustomDefaultTheme = {
    ...DefaultTheme,
    fonts: configureFonts({}),  //todo: define own font
    colors: {
        ...DefaultTheme.colors,
        primary: 'rgb(2,113,187)',
        accent: '#c40017',

    },
    dark: false,
    mode: 'adaptive'
}
export const CustomDarkTheme = {
    ...DarkTheme,
    fonts: configureFonts({}),
    colors: {
        ...DarkTheme.colors,
         primary: '#08B6D1',
         accent: '#DB0B8B',
    },
    dark: true,
    mode: 'adaptive'
}
