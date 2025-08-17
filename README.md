# Aura Visualizer 📊

**Outil professionnel de visualisation et d'analyse de questionnaires**

Transformez vos données Excel brutes et vos questionnaires JSON/JS en visualisations interactives et professionnelles. Importez, analysez, explorez et exportez vos résultats de questionnaires en quelques clics.

## ✨ Fonctionnalités Principales

### 🔄 Import Intelligent
- **Questionnaires JSON/JS** : Parser automatique de la structure complète
- **Réponses Excel** : Mapping intelligent des colonnes vers les questions
- **Validation** : Détection et gestion des erreurs de données
- **Support multi-format** : JSON, JS, Excel (.xlsx, .xls), CSV

### 📈 Visualisations Riches
- **Graphiques en barres** interactifs avec tri et animation
- **Graphiques circulaires** avec sélection et mise en évidence
- **Histogrammes** pour les données numériques
- **Nuages de mots** pour les réponses textuelles
- **Matrices de corrélation** pour analyser les relations
- **Graphiques de comparaison** multi-questions

### 🔍 Filtrage Avancé
- **Filtres dynamiques** par question et valeur
- **Filtres numériques** avec plages min/max
- **Recherche textuelle** dans les réponses ouvertes
- **Combinaison de filtres** pour analyses ciblées
- **Sauvegarde des filtres** actifs

### 📤 Export Multi-format
- **PDF professionnel** avec graphiques et statistiques
- **Excel enrichi** avec données, stats et tableaux croisés
- **HTML interactif** avec filtres et graphiques dynamiques
- **Export personnalisable** selon vos besoins

## 🚀 Démarrage Rapide

### Installation

```bash
# Cloner le repository
git clone https://github.com/votre-username/aura-visualizer.git
cd aura-visualizer

# Installer les dépendances
npm install

# Démarrer en développement
npm run dev

# Construire pour la production
npm run build

# Démarrer le serveur
npm run serve
```

### Utilisation

1. **Importez vos fichiers**
   - Questionnaire (JSON/JS) : Structure, questions, options, logiques
   - Réponses (Excel/CSV) : Données brutes des répondants

2. **Analysez vos données**
   - Visualisez les statistiques globales
   - Explorez question par question
   - Appliquez des filtres pour segmenter

3. **Créez des visualisations**
   - Sélectionnez les questions à visualiser
   - Choisissez les types de graphiques
   - Personnalisez l'affichage

4. **Exportez vos résultats**
   - PDF : Rapport complet professionnel
   - Excel : Données et statistiques détaillées
   - HTML : Page interactive partageable

## 📋 Structure des Questionnaires

### Format JSON/JS Supporté

```javascript
{
  "title": "Mon Questionnaire",
  "description": "Description du questionnaire",
  "version": "1.0",
  "language": "fr",
  "questions": {
    "Q1": {
      "label": "Quelle est votre satisfaction ?",
      "type": "single_choice",
      "required": true,
      "options": {
        "1": "Très insatisfait",
        "2": "Insatisfait", 
        "3": "Neutre",
        "4": "Satisfait",
        "5": "Très satisfait"
      }
    },
    "Q2_MONTANTS": {
      "label": "Quel montant avez-vous dépensé ?",
      "type": "numeric",
      "format": "currency"
    },
    "Q3_AUTRE": {
      "label": "Autres commentaires",
      "type": "text",
      "format": "open_text"
    }
  },
  "routing": {
    "branching": {
      "Q1": [
        {
          "condition": "value == 1",
          "action": "goto",
          "target": "Q4"
        }
      ]
    }
  }
}
```

### Types de Questions Supportés

- **single_choice** : Question à choix unique
- **multiple_choice** : Question à choix multiples  
- **numeric** : Valeur numérique
- **text** : Texte libre
- **date** : Date
- **email** : Adresse email

### Conventions de Nommage

- **_MONTANTS** : Questions numériques monétaires
- **_ACCOMPAGNATEURS** : Questions de comptage
- **_AUTRE** : Questions textuelles ouvertes
- **_COMMUNE**, **_VILLE** : Questions de localisation
- **_GARE**, **_STATION** : Questions de transport

## 📊 Structure des Données Excel

### Format Attendu

| Q1 | Q2_MONTANTS | Q3_AUTRE | ... |
|----|-------------|----------|-----|
| 1  | 150.50      | Très bien| ... |
| 3  | 89.99       | Parfait  | ... |
| 5  | 200.00      | Excellent| ... |

### Mapping Automatique

L'outil mappe automatiquement :
- **Colonnes Excel** ↔ **IDs Questions**
- **Valeurs numériques** ↔ **Libellés options**
- **Détection des erreurs** et suggestions de correction
- **Gestion des valeurs manquantes**

## 🛠️ Architecture Technique

### Technologies Utilisées

**Frontend :**
- Vue.js 3 (Composition API)
- Pinia (State Management)
- Vue Router
- Tailwind CSS

**Traitement des données :**
- XLSX.js (Lecture Excel)
- Canvas API (Graphiques custom)
- jsPDF (Export PDF)
- HTML2Canvas (Capture graphiques)

**Serveur :**
- Express.js
- Multer (Upload fichiers)
- Support multi-format

### Structure du Projet

```
aura-visualizer/
├── src/
│   ├── components/          # Composants Vue réutilisables
│   │   ├── charts/         # Composants de graphiques
│   │   └── QuestionAnalysis.vue
│   ├── views/              # Vues principales
│   │   ├── Home.vue        # Page d'accueil
│   │   ├── Upload.vue      # Import des fichiers
│   │   ├── Analysis.vue    # Analyse des données
│   │   ├── Visualization.vue # Graphiques
│   │   └── Export.vue      # Export des résultats
│   ├── stores/             # Gestion d'état Pinia
│   │   └── app.js         # Store principal
│   ├── utils/              # Utilitaires
│   │   ├── questionnaireParser.js # Parser JSON/JS
│   │   ├── excelReader.js  # Lecteur Excel
│   │   └── exporters/      # Modules d'export
│   └── style.css          # Styles Tailwind
├── server.js              # Serveur Express
├── package.json           # Dépendances
└── README.md             # Documentation
```

## 📈 Exemples d'Usage

### 1. Questionnaire de Satisfaction Client

```javascript
// questionnaire.json
{
  "title": "Satisfaction Client 2024",
  "questions": {
    "Q1": {
      "label": "Comment évaluez-vous notre service ?",
      "type": "single_choice",
      "options": {
        "1": "Très mauvais",
        "2": "Mauvais",
        "3": "Moyen", 
        "4": "Bon",
        "5": "Excellent"
      }
    },
    "Q2_MONTANTS": {
      "label": "Montant de votre dernière commande",
      "type": "numeric",
      "format": "currency"
    }
  }
}
```

**Fichier Excel :**
```
Q1 | Q2_MONTANTS | Date
4  | 89.99       | 2024-01-15
5  | 156.50      | 2024-01-16
3  | 45.00       | 2024-01-17
```

**Résultat :** Graphiques de satisfaction, analyse des montants, corrélations.

### 2. Enquête de Transport

```javascript
{
  "title": "Habitudes de Transport",
  "questions": {
    "Q1": {
      "label": "Mode de transport principal",
      "type": "single_choice",
      "options": {
        "1": "Voiture",
        "2": "Transport public",
        "3": "Vélo",
        "4": "Marche"
      }
    },
    "Q2_GARE": {
      "label": "Gare la plus utilisée",
      "type": "text",
      "format": "transport"
    }
  }
}
```

## 🎨 Personnalisation

### Thèmes et Couleurs

L'outil utilise Tailwind CSS pour une personnalisation facile :

```css
/* Modifier les couleurs primaires */
:root {
  --color-primary: #3B82F6;
  --color-accent: #8B5CF6;
}
```

### Graphiques Personnalisés

Ajoutez vos propres types de graphiques dans `/src/components/charts/`.

### Formats d'Export

Étendez les exporteurs dans `/src/utils/exporters/` pour supporter de nouveaux formats.

## 🔧 Configuration

### Variables d'Environnement

```bash
# .env
VITE_API_URL=http://localhost:3001
VITE_MAX_FILE_SIZE=50MB
VITE_SUPPORTED_FORMATS=json,js,xlsx,xls,csv
```

### Configuration Serveur

```javascript
// server.js
const config = {
  port: process.env.PORT || 3001,
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedOrigins: ['http://localhost:3000']
}
```

## 🚨 Dépannage

### Problèmes Courants

**1. Fichier Excel non reconnu**
- Vérifiez le format (.xlsx, .xls)
- Assurez-vous que la première ligne contient les en-têtes
- Vérifiez l'encodage (UTF-8 recommandé)

**2. Questions non mappées**
- Vérifiez la correspondance entre les noms de colonnes Excel et les IDs de questions
- Utilisez le mapping manuel si nécessaire

**3. Graphiques ne s'affichent pas**
- Vérifiez que les questions ont des réponses valides
- Contrôlez les types de données (numérique vs texte)

**4. Export PDF échoue**
- Vérifiez la taille des données
- Réduisez le nombre de graphiques si nécessaire

### Logs de Debug

```javascript
// Activer les logs détaillés
localStorage.setItem('aura_debug', 'true')
```

## 🤝 Contribution

### Développement

```bash
# Fork le projet
git clone https://github.com/votre-fork/aura-visualizer.git

# Créer une branche
git checkout -b feature/nouvelle-fonctionnalite

# Développer et tester
npm run dev

# Commit et push
git commit -m "Ajout nouvelle fonctionnalité"
git push origin feature/nouvelle-fonctionnalite
```

### Guidelines

- Utilisez la Composition API Vue 3
- Suivez les conventions de nommage
- Ajoutez des tests pour les nouvelles fonctionnalités
- Documentez les nouvelles API

## 📄 Licence

MIT License - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Équipe

- **Développement** : Équipe Aura Visualizer
- **Design UX/UI** : Interface moderne et intuitive
- **Architecture** : Solution scalable et performante

## 📞 Support

- **Documentation** : [Wiki du projet](https://github.com/votre-username/aura-visualizer/wiki)
- **Issues** : [GitHub Issues](https://github.com/votre-username/aura-visualizer/issues)
- **Discussions** : [GitHub Discussions](https://github.com/votre-username/aura-visualizer/discussions)

---

**Aura Visualizer** - Transformez vos données en insights 📊✨