export const genderOptions = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
] as const;

export const professionOptions: string[] = [
  "Выберите ваш род занятий",
  "Обучаюсь",
  "Студент",
  "Работаю",
  "Запускаю собственный проект",
] as const;


export const badges = [
    "Narrative tactician",
    "Keeps secrets",
    "Loyal to the core",
];


export const milestones = [
    "Built the first multilingual storyline engine",
    "Hosted a co-creation salon in Lisbon",
    "Launched Talkie mentorship series",
    "Documented narrative design patterns",
];


export const initialProfile = {
    userName: "Vadim Stepanov",
    gender: "MALE",
    intro: "AI product designer exploring the edges of digital companions.",
    profession: "Выберите ваш род занятий",
};


export const genderLabels: Record<string, string> = {
    MALE: "Male",
    FEMALE: "Female",
};
