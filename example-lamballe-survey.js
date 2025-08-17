// 🚄 LAMBALLE-ARMOR TRAIN STATION INTERMODALITY SURVEY
// Based on AREP mobility study questionnaire

export const templateSurveyQuestions = [
    // Q1 - Station presence reason (filters survey flow)
    {
        id: "Q1",
        text: "Quelle est la raison de votre présence en gare ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Je vais prendre le train", next: "Q2_MONTANTS" },
            { id: 2, text: "Je viens de descendre du train", next: "end" },
            { id: 3, text: "J'accompagne des voyageurs qui partent / J'attends des voyageurs qui arrivent", next: "Q2_ACCOMPAGNATEURS" },
            { id: 4, text: "Autre raison (achat billet, commerces en gare...)", next: "Q2_ACCOMPAGNATEURS" }
        ]
    },

    // Q2 - Origin for train passengers (montants)
    {
        id: "Q2_MONTANTS",
        text: "Quelle est l'origine de votre déplacement ? D'où êtes-vous parti pour arriver à la gare ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Lamballe-Armor", next: "Q2A_MONTANTS" },
            { id: 2, text: "Autre commune", next: "Q2_AUTRE_MONTANTS" }
        ]
    },

    // Q2 - Autre commune
    {
        id: "Q2_AUTRE_MONTANTS",
        text: "Préciser nom de la commune :",
        type: 'commune',
        next: "Q3_MONTANTS"
    },

    // Q2a - Street in Lamballe-Armor
    {
        id: "Q2A_MONTANTS",
        text: "De quelle rue de Lamballe-Armor venez-vous ?",
        type: 'street',
        next: "Q3_MONTANTS"
    },

    // Q3 - Transport mode to station
    {
        id: "Q3_MONTANTS",
        text: "Quel mode de transport avez-vous utilisé pour vous rendre à la gare ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "À pied", next: "Q4_MONTANTS" },
            { id: 2, text: "En voiture -- en tant que conducteur", next: "Q3A_MONTANTS" },
            { id: 3, text: "En voiture -- en tant que passager", next: "Q4_MONTANTS" },
            { id: 4, text: "En covoiturage avec un autre usager du train", next: "Q4_MONTANTS" },
            { id: 5, text: "En bus/car", next: "Q3B_MONTANTS" },
            { id: 6, text: "À vélo", next: "Q3D_MONTANTS" },
            { id: 7, text: "En trottinette", next: "Q3D_MONTANTS" },
            { id: 8, text: "En Taxi/VTC", next: "Q4_MONTANTS" },
            { id: 9, text: "En 2 roues Motorisé (Moto, scooter...)", next: "Q3A_MONTANTS" },
            { id: 10, text: "En train - je fais une correspondance", next: "Q4_MONTANTS" },
            { id: 11, text: "Autre", next: "Q3_AUTRE_MONTANTS" }
        ]
    },

    // Q3 - Autre transport mode
    {
        id: "Q3_AUTRE_MONTANTS",
        text: "Préciser le mode de transport :",
        type: 'freeText',
        freeTextPlaceholder: "Préciser",
        next: "Q4_MONTANTS"
    },

    // Q3a - Vehicle parking location
    {
        id: "Q3A_MONTANTS",
        text: "Où avez-vous stationné votre véhicule ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Sur le parking gare Ouest (durée limitée)", next: "Q3A_PRIME_MONTANTS" },
            { id: 2, text: "Sur le parking gare Est (gratuit)", next: "Q3A_PRIME_MONTANTS" },
            { id: 3, text: "Sur le parking gare Sud (gratuit)", next: "Q3A_PRIME_MONTANTS" },
            { id: 4, text: "Sur le parking face à l'école Saint-Joseph au Sud (gratuit)", next: "Q3A_PRIME_MONTANTS" },
            { id: 5, text: "Sur le parking de la salle municipale à 5 minutes à pied au Sud-Ouest", next: "Q3A_PRIME_MONTANTS" }
        ]
    },

    // Q3a' - Parking duration
    {
        id: "Q3A_PRIME_MONTANTS",
        text: "Combien de temps allez-vous laisser votre véhicule stationné ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Moins de 2 heures", next: "Q4_MONTANTS" },
            { id: 2, text: "Une demi-journée (entre 2 et 4 heures)", next: "Q4_MONTANTS" },
            { id: 3, text: "Une journée entière (entre 4h et 12h)", next: "Q4_MONTANTS" },
            { id: 4, text: "2 à 3 jours", next: "Q4_MONTANTS" },
            { id: 5, text: "3 à 6 jours", next: "Q4_MONTANTS" },
            { id: 6, text: "1 semaine ou plus", next: "Q4_MONTANTS" }
        ]
    },

    // Q4 - Transport subscription
    {
        id: "Q4_MONTANTS",
        text: "Possédez-vous un abonnement de transport ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Oui, un abonnement TER", next: "Q5_MONTANTS" },
            { id: 2, text: "Oui, un abonnement couplé TER-Bus", next: "Q5_MONTANTS" },
            { id: 3, text: "Non", next: "Q5_MONTANTS" }
        ]
    },

    // Q5 - Final destination station
    {
        id: "Q5_MONTANTS",
        text: "Quelle sera votre gare de destination finale ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Rennes", next: "Q6_MONTANTS" },
            { id: 2, text: "Saint-Brieuc", next: "Q6_MONTANTS" },
            { id: 3, text: "Guingamp", next: "Q6_MONTANTS" },
            { id: 4, text: "Paris-Montparnasse", next: "Q6_MONTANTS" },
            { id: 5, text: "Morlaix", next: "Q6_MONTANTS" },
            { id: 6, text: "Brest", next: "Q6_MONTANTS" },
            { id: 7, text: "Dinan", next: "Q6_MONTANTS" },
            { id: 8, text: "Autre", next: "Q5_AUTRE_MONTANTS" }
        ]
    },

    // Q5 - Autre destination
    {
        id: "Q5_AUTRE_MONTANTS",
        text: "Préciser la gare de destination :",
        type: 'gare',
        next: "Q6_MONTANTS"
    },

    // Q6 - Trip purpose
    {
        id: "Q6_MONTANTS",
        text: "Quel est le motif de votre déplacement en train ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Je me rends sur mon lieu de travail", next: "Q7_MONTANTS" },
            { id: 2, text: "Je me rends sur mon lieu d'études", next: "Q7_MONTANTS" },
            { id: 3, text: "Je rentre à mon domicile principal", next: "Q6A_MONTANTS" },
            { id: 4, text: "Déplacement professionnel", next: "Q7_MONTANTS" },
            { id: 5, text: "Loisirs, tourisme", next: "Q7_MONTANTS" },
            { id: 6, text: "Autres", next: "Q6_AUTRE_MONTANTS" }
        ]
    },

    // Q6 - Autre trip purpose
    {
        id: "Q6_AUTRE_MONTANTS",
        text: "Préciser le motif (Achats, démarches administratives, RDV médical...) :",
        type: 'freeText',
        freeTextPlaceholder: "Préciser",
        next: "Q7_MONTANTS"
    },

    // Q6a - Reason for coming to Lamballe-Armor
    {
        id: "Q6A_MONTANTS",
        text: "Quel était la raison de votre venue à Lamballe-Armor ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Travail", next: "Q7_MONTANTS" },
            { id: 2, text: "Études", next: "Q7_MONTANTS" },
            { id: 3, text: "Déplacement professionnel", next: "Q7_MONTANTS" },
            { id: 4, text: "Loisirs, tourisme", next: "Q7_MONTANTS" },
            { id: 5, text: "Autres (Achats, démarches administratives, RDV médical, visite...)", next: "Q7_MONTANTS" }
        ]
    },

    // Q7 - Improvement suggestions
    {
        id: "Q7_MONTANTS",
        text: "Selon vous, que faudrait-il faire en priorité pour améliorer les conditions d'accès à cette gare ?",
        type: 'freeText',
        freeTextPlaceholder: "Noter seulement les mots clés",
        next: "end"
    },

    // ============ SECTION ACCOMPAGNATEURS ============

    // Q2 - Origin for companions/others
    {
        id: "Q2_ACCOMPAGNATEURS",
        text: "Quelle est l'origine de votre déplacement ? D'où êtes-vous parti pour arriver à la gare ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Lamballe-Armor", next: "Q2A_ACCOMPAGNATEURS" },
            { id: 2, text: "Autre commune", next: "Q2_AUTRE_ACCOMPAGNATEURS" }
        ]
    },

    // Q2 - Autre commune pour accompagnateurs
    {
        id: "Q2_AUTRE_ACCOMPAGNATEURS",
        text: "Préciser nom de la commune :",
        type: 'commune',
        next: "Q3_ACCOMPAGNATEURS"
    },

    // Q2a - Street in Lamballe-Armor pour accompagnateurs
    {
        id: "Q2A_ACCOMPAGNATEURS",
        text: "De quelle rue de Lamballe-Armor venez-vous ?",
        type: 'street',
        next: "Q3_ACCOMPAGNATEURS"
    },

    // Q3 - Transport mode pour accompagnateurs
    {
        id: "Q3_ACCOMPAGNATEURS",
        text: "Quel mode de transport avez-vous utilisé pour vous rendre à la gare ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "À pied", next: "Q4_ACCOMPAGNATEURS" },
            { id: 2, text: "En voiture -- en tant que conducteur", next: "Q3A_ACCOMPAGNATEURS" },
            { id: 3, text: "En voiture -- en tant que passager", next: "Q4_ACCOMPAGNATEURS" },
            { id: 4, text: "En covoiturage avec un autre usager du train", next: "Q4_ACCOMPAGNATEURS" },
            { id: 5, text: "En bus/car", next: "Q4_ACCOMPAGNATEURS" },
            { id: 6, text: "À vélo", next: "Q4_ACCOMPAGNATEURS" },
            { id: 7, text: "En trottinette", next: "Q4_ACCOMPAGNATEURS" },
            { id: 8, text: "En Taxi/VTC", next: "Q4_ACCOMPAGNATEURS" },
            { id: 9, text: "En 2 roues Motorisé (Moto, scooter...)", next: "Q3A_ACCOMPAGNATEURS" }
        ]
    },

    // Q3a - Vehicle parking pour accompagnateurs
    {
        id: "Q3A_ACCOMPAGNATEURS",
        text: "Où avez-vous stationné votre véhicule ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Sur le parking gare Ouest (durée limitée)", next: "Q4_ACCOMPAGNATEURS" },
            { id: 2, text: "Sur le parking gare Est (gratuit)", next: "Q4_ACCOMPAGNATEURS" },
            { id: 3, text: "Sur le parking gare Sud (gratuit)", next: "Q4_ACCOMPAGNATEURS" },
            { id: 4, text: "Sur le parking face à l'école Saint-Joseph au Sud (gratuit)", next: "Q4_ACCOMPAGNATEURS" },
            { id: 5, text: "Sur le parking de la salle municipale à 5 minutes à pied au Sud-Ouest", next: "Q4_ACCOMPAGNATEURS" }
        ]
    },

    // Q4 - Final question pour accompagnateurs
    {
        id: "Q4_ACCOMPAGNATEURS",
        text: "Selon vous, que faudrait-il faire en priorité pour améliorer les conditions d'accès à cette gare ?",
        type: 'freeText',
        freeTextPlaceholder: "Noter seulement les mots clés",
        next: "end"
    }
];
