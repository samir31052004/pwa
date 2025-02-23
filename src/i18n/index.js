import { createI18n } from 'vue-i18n'

const messages = {
  'fr': {
    common: {
      dashboard: 'Tableau de bord',
      tripHistory: 'Historique des trajets',
      incidentReport: 'Rapport d\'incident',
      logout: 'Déconnexion',
      back: 'Retour'
    },
    auth: {
      login: 'Connexion',
      useBiometric: 'Utiliser la biométrie',
      useFingerprint: 'Utiliser l\'empreinte digitale',
      useFaceId: 'Utiliser Face ID'
    },
    trips: {
      status: {
        onTime: 'À l\'heure',
        delayed: 'En retard',
        veryDelayed: 'Très en retard'
      },
      technical: {
        // French technical terms
        brakeIssue: 'Frein défectueux',
        engineProblem: 'Problème moteur',
        transmissionIssue: 'Problème de transmission',
        fuelEfficiency: 'Efficacité du carburant'
      }
    },
    accessibility: {
      skipToContent: 'Passer au contenu',
      screenReader: {
        tripStatus: 'État du trajet : {status}',
        loadingData: 'Chargement des données',
        navigationMenu: 'Menu de navigation'
      }
    }
  }
}

export const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  fallbackLocale: 'fr',
  messages,
  // Enable HTML in translations for accessibility labels
  warnHtmlInMessage: 'off'
})