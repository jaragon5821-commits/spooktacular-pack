# Chop's Spooktacular changelog

Versions are `YYYY.MM.DD-N`: the date of the release and its number that day. Every change that
is pushed to the pack gets a new version, an entry here, and (after Chop approves the wording)
a post in #modpack-updates. "Players" is what gets posted; "Behind the scenes" is for reference.

## 2026.10.27-2

Players
- The "Keybinds and Essential Hotkeys" quest now lists the real default keys: J for the map,
  M for Forgematica, hold ` for vein mining, R for the walkie-talkie and carriage harness, and
  the wardrobe button in your inventory for Cosmetic Armor. It also explains how to spot and fix
  key conflicts.

Behind the scenes
- Quest text edit in Before You Start (quest 271386B9E5F1CB59). Defaults checked in the mod jars.

## 2026.10.27-1 (first tracked release)

Players
- The pack is now called Chop's Spooktacular. Existing installs update as normal; the Prism
  instance keeps its old name until you rename it.
- Quest book cleanup: quests that mentioned mods not in the pack now describe what is
  actually in the game. No quest progress or rewards changed.

Behind the scenes
- `pack.toml` name changed; repository and update address unchanged.
- Quest text edits in Before You Start, Chapter 1 and Chapter 2.
- New friend zip: "Chop's Spooktacular - Prism instance.zip" (Google Drive, Exports).
- Server list description (MOTD) set to "Chop's Spooktacular".

## Before tracking (launch, 2026-10-25 to 2026-10-26)

Reconstructed from the commit history.

- 2026.10.26-8: quest WS08 teaches Easy Place on the Hallowstown blueprints.
- 2026.10.26-7: removed Forgematica Printer (crashed on Java 17).
- 2026.10.26-6: added the Hallowstown Forgematica and WorldEdit schematics.
- 2026.10.26-5: 28 mod updates (including Dreamshift 0.2.1); sleeping uses the vanilla 66% rule.
- 2026.10.26-4: added Better Days (30-minute days and nights), removed DarkSleep.
- 2026.10.26-3: removed the Apollyon quest (Q-DM17).
- 2026.10.26-2: quest rewrites and Chapter 7, Workshop Guides.
- Initial: pack moved from CurseForge to Prism + packwiz.
