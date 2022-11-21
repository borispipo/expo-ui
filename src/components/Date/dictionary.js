const Dictionary = {
    fr : {
        save: 'Enregistrer',
        selectSingle: 'Selectionner la date',
        selectMultiple: 'Selectionner les dates',
        selectRange: 'Selectionner une période',
        notAccordingToDateFormat: (inputFormat) =>`La valeur définie doit être au format ${inputFormat}`,
        mustBeHigherThan: 'Doit être plus anciene de',
        mustBeLowerThan: 'doit être plus récente de',
        mustBeBetween: 'doit être entre',
        dateIsDisabled: 'la date n\'est pas autorisée',
        previous: 'Précédent',
        next: 'Suivant',
        typeInDate: 'Entrer la date',
        pickDateFromCalendar: 'Sélectionner une date dans le calendrier',
        close: 'Fermer',
        "DD/MM/YYYY" : "JJ/MM/AAAA",
    },
    en : {
        save: 'Save',
        selectSingle: 'Select date',
        selectMultiple: 'Select dates',
        selectRange: 'Select period',
        notAccordingToDateFormat: (inputFormat) =>`Date format must be ${inputFormat}`,
        mustBeHigherThan: 'Must be later then',
        mustBeLowerThan: 'Must be earlier then',
        mustBeBetween: 'Must be between',
        dateIsDisabled: 'Day is not allowed',
        previous: 'Previous',
        next: 'Next',
        typeInDate: 'Type in date',
        pickDateFromCalendar: 'Pick date from calendar',
        close: 'Close',
        "DD/MM/YYYY" : "DD/MM/AAAA"
    }
}

export default Dictionary;