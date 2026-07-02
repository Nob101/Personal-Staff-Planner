
/**
 * Wichtig!
 * 
 * Automatische Versionierungskontrolle
 * Da im Frontend und backend jeweils eigene Package.json-Files liegen,
 * muss es über die Pfade kennen.
 * -Lukas
 */

const wrapPlugin = require('@semantic-release-monorepo/core');    //Monorepo sorgt für die Trennung der jeweiligen Unterordenr

module.exports = {
    branches: [ 'main', 'master'],

    packages: [
        'Frontend',
        'backend'
    ],

    plugins: [
        '@semantic-release/commit-analyzer',  // Analysiert die Commits nach 'Conventional Commits Rules'
        '@semantic-release/release-notes-generator',  //Erstellt die Change-logs zur Einsicht

        ['@semantic-release/npm', {
            npmPublish: false,  //FIX: Ausfallschutz (kein NPM Upload)
        }],

        ['@semantic-release/github', {   //WICHTIG: Erstellt den TAG für GitHub Repo
            assets: [],
            successComment: "PR wurde in Version ${nextRelease.version} veröffentlicht",
        }]

    ].map(wrapPlugin)
};


