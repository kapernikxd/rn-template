import { StyleSheet } from 'react-native';
import { FontsType, ThemeType } from '../theme';

/**
    COMMON COMPONENT STYLES
*/
export const getCommonStyles = ({ fonts, theme}: { theme: ThemeType, fonts: FontsType }) => StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    card: {
        backgroundColor: theme.white,
        padding: 8,
        borderBottomColor: theme.border,
        borderRadius: 8, // optional
        marginBottom: 4, // optional, for spacing between cards
    },

    descriptionCard: {
        ...fonts.fontSm,
        fontWeight: "500",
        color: theme.greyText,
        textTransform: 'uppercase',
    },

    imageCard: {
        width: 120,
        height: 120,
        borderRadius: 8,
        marginRight: 12,
    },
 
    /*
    ** IMAGES
    */
    avatarXs: {
        width: 25,
        height: 25,
        borderRadius: 20,
    },
    avatarSm: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    avatarMd: {
        width: 60,
        height: 60,
        borderRadius: 40,
    },
    avatarLg: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    avatarXl: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    /*
    ** shadow
    */
    shadow: {
        elevation: 3,
        shadowColor: theme.black,
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 2,
    },
    /*
    ** background
    */
    backgroundLight: {
        backgroundColor: theme.white,
    },
    background: {
        backgroundColor: theme.background,
    },
    backgroundDark: {
        backgroundColor: theme.light,
    },
    backgroundRGBA: {
        backgroundColor: theme.backgroundSemiTransparent,
    },
    /*
    ** button
    */
    btnicon: {
        width: 32,
        height: 32,
        backgroundColor: theme.backgroundBtn,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
})

export type CommonStylesType = ReturnType<typeof getCommonStyles>;