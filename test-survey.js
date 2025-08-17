export const templateSurveyQuestions = [
    {
        id: "Q1",
        text: "Quelle est la raison de votre présence en gare ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Je vais prendre le train", next: "Q2_MONTANTS" },
            { id: 2, text: "Je viens de descendre du train", next: "end" }
        ]
    }
];
