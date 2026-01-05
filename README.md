Dokumentation: Tunnel-Njeris

Zur Idee kam Adriel nach kurzer Durchforschung der öffentlichen Daten der Stadt Zürich. Der Velozähler gab uns eine gute Grundlage und diese Daten mit dem Wetter zu kombinieren macht es interessant. 
Das Design kam schnell zu Stande, Adriel übernahm dort den grösseren Teil der Arbeit. Wir stützten uns beim Design auf das jenige der Stadt Zürich, um die Seite offiziel aussehen zu lassen. Die Details wie das Logo Icon haben wir personalisiert.
Anfangs hatten wir Schwierigkeiten mit der Technik, da die API der Stadt Zürich nur jeweils 100 Datensätze geliefert hat. Nach einer Kontaktaufnahme mit Mitarbeitenden der zugehörigen Stadtbehörde konnten wir jedoch einen API-link erstellen, der uns alle relevanten Daten lieferte.
Mit ChatGPT erstellten wir dann zuerst eine Placeholder-Webpage, um die Daten später darauf darzustellen. Danach begann Robin mit der Backend-Technik, da Adriel im Designprozess mehr gemacht hatte. Mit Hilfe von Gemini und ChatGPT konnte ziemlich bald ein funktionierender Prototyp erstellt werden.
Wir hatten noch ein Problem, da die API der Stadt Zürich die Zählerdaten zwar täglich aktualisiert, aber die daten sind immer 3 Tage alt weil die Zählergeräte nicht am Strom hängen und die Daten mit Mobilfunk versendet werden. Dies machte es schwierig mit der Darstellung, aber wir wollten wegen dem nicht neu starten und fanden eine Lösung

Das ETL script zu bauen war nicht allzu schwierig, aber wir stiessen beim Cron-job auf eine Wand. Das angegebene Cron tool war sehr schwer zu bedienen, und das Task Scheduling Tool auf Infomaniak sahen wir dann als eine bessere Lösung, also benutzt unsere Webseite das. Trotzdem befassten wir uns mit der Funktion des Cronjobs, um es zu verstehen.
Als das ETL und der Task Scheduler sauber lief, bauten wir die webseite mit allen geplanten graphen aus und verfeinerten zu schluss den Textinhalt, das CSS und machten letzte Anpassungen im JS.
