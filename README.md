Dokumentation: Tunnel-Njeris

WICHTIG: Die Zähler-API der Stadt Zürich liefert seit dem Ende des Jahres 2025 keine Daten mehr. (Stand 6. Januar 2026) Es liegt wohl an der Weise, wie die Daten des Zählers zur Schnittstelle gesendet werden (weiter unten erklärt). Dies könnte sich jedoch bis zum 9. Januar noch ändern. Wir konnten dies leider in keiner Sicht vorhersehen. Die Webseite lief seit der Fertigstellung vor Weihnachten 2025 bis Neujahr einwandfrei.

Das Projekt Tunnel-Njeris zeigt Besuchern der Webseite mehrere Graphen, die Daten der Velofahrenden im Stadttunnel in Zürich mit Daten des lokalen Wetters vergleichen. Damit wollen die Entwickler Adriel Monostori und Robin Luijten untersuchen und veranschaulichen, wie das Wetter, spezifischer der Niederschlag und die Lufttemperatur das Fahrverhalten auf den Fahrrad beinflussen.

Zur Idee kam Adriel nach kurzer Durchforschung der öffentlichen Daten der Stadt Zürich. Der Velozähler gab uns eine gute Grundlage und diese Daten mit dem Wetter zu kombinieren macht es interessant. 
Das Design kam schnell zu Stande, Adriel übernahm dort den grösseren Teil der Arbeit. Wir stützten uns beim Design auf das jenige der Stadt Zürich, um die Seite offiziel aussehen zu lassen. Die Details wie das Logo Icon haben wir personalisiert.
Anfangs hatten wir Schwierigkeiten mit der Technik, da die API der Stadt Zürich nur jeweils 100 Datensätze geliefert hat. Nach einer Kontaktaufnahme mit Mitarbeitenden der zugehörigen Stadtbehörde konnten wir jedoch einen API-link erstellen, der uns alle relevanten Daten lieferte.
Mit ChatGPT erstellten wir dann zuerst eine Placeholder-Webpage, um die Daten später darauf darzustellen. Danach begann Robin mit der Backend-Technik, da Adriel im Designprozess mehr gemacht hatte. Mit Hilfe von Gemini und ChatGPT konnte ziemlich bald ein funktionierender Prototyp erstellt werden.
Wir hatten noch ein Problem, da die API der Stadt Zürich die Zählerdaten zwar täglich aktualisiert, aber die daten sind immer 3 Tage alt weil die Zählergeräte nicht am Strom hängen und die Daten mit Mobilfunk versendet werden. Dies machte es schwierig mit der Darstellung, aber wir wollten wegen dem nicht neu starten und fanden eine Lösung

Das ETL script zu bauen war nicht allzu schwierig, aber wir stiessen beim Cron-job auf eine Wand. Das angegebene Cron tool war sehr schwer zu bedienen, und das Task Scheduling Tool auf Infomaniak sahen wir dann als eine bessere Lösung, also benutzt unsere Webseite das. Trotzdem befassten wir uns mit der Funktion des Cronjobs, um es zu verstehen.
Als das ETL und der Task Scheduler sauber lief, bauten wir die webseite mit allen geplanten graphen aus und verfeinerten zu schluss den Textinhalt, das CSS und machten letzte Anpassungen im JS.

Zur KI: zu beginn hat Robin nur chatGPT verwendet und dann irgendwann hat er zu gemini gewechselt. Gemini scheint für Coding besser zu sein, und mehr den code zu behalten. Wenn man den Code aus der KI abschreibt und mitüberlegt, welche line was macht, versteht man am schluss auch seinen code selbst und kann einfacher änderungen vornehmen, also ist direkt kopieren sicher nicht eine gute idee.
