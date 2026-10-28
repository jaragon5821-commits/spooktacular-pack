# Patched mod jars

Mods we had to fix ourselves. Each one is downloaded through its own `mods/*.pw.toml`, which
points at the file here by commit, so packwiz does not index this folder (see `.packwizignore`).

## ForgematicaPrinter-0.1.0-mc1.20.1-java17fix.jar

- Upstream: Forgematica Printer 0.1.0+mc1.20.1 by TexTrue / ThinkingStudio, AGPLv3.
  Source: https://github.com/ThinkingStudios/ForgematicaPrinter
  Original jar: https://modrinth.com/mod/oqw1j8E7/version/Iu8zwuRq
- Problem: `GeneralPlacementGuide.getValidSide` calls `List.getFirst()`, which only exists on
  Java 21. The pack runs on Java 17, so the game crashed with `NoSuchMethodError` while printing
  (upstream issues #2 and #9).
- Fix: that one call is replaced with `List.get(0)` (same result; the list is checked for empty
  first). Nothing else in the jar changed. `PatchPrinter.java` here is the exact patch:
  `java -cp asm-9.7.1.jar PatchPrinter.java <original.jar> <patched.jar>`
- Not fixed: directional blocks can still be placed facing the wrong way (upstream issue #5).
