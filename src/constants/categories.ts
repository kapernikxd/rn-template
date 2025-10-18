export enum ECategories {
    RESET = "reset",
    EXHIBITIONS = "exhibitions",
    KIDS = "kids",
    LEISURE = "leisure",
    STANDUP = "standUp",
    EDUCATION = "education",
    THEATERS = "theaters",
    GAMES = "games",
    MOVIE = "movie",
    CONCERTS = "concerts",
}

export type Category = {
    value: ECategories;
    label: string;
    // icon: React.JSX.Element;
}

export const CATEGORIES: Category[] = [
    {
        value: ECategories.RESET,
        label: "Reset",
        // icon: <UilBan size={25} />,
    },
    {
        value: ECategories.EXHIBITIONS,
        label: "Exhibitions",
        // icon: <UilPresentation size={25} />,
    },
    {
        value: ECategories.KIDS,
        label: "With kids",
        // icon: <UilKid size={25} />,
    },
    {
        value: ECategories.LEISURE,
        label: "Active leisure",
        // icon: <UilKayak size={25} />,
    },
    {
        value: ECategories.STANDUP,
        label: "Stand-up",
        // icon: <UilMicrophone size={25} />,
    },
    {
        value: ECategories.EDUCATION,
        label: "Education",
        // icon: <UilBrain size={25} />,
    },
    {
        value: ECategories.THEATERS,
        label: "Theaters",
        // icon: <UilUniversity size={25} />,
    },
    {
        value: ECategories.GAMES,
        label: "Games",
        // icon: <UilDiceFive size={25} />,
    },
    {
        value: ECategories.MOVIE,
        label: "Movie",
        // icon: <UilFilm size={25} />,
    },
    {
        value: ECategories.CONCERTS,
        label: "Concerts",
        // icon: <UilMusic size={25} />,
    },
]

export const CATEGORIES$ = CATEGORIES.filter((tag) => tag.value !== ECategories.RESET)