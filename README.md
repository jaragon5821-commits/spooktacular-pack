# Josh's Halloween Spooktacular 2026 (pack)

Private friends-only Forge 1.20.1 modpack (Forge 47.4.26), delivered with
[packwiz](https://packwiz.infra.link/). Nothing here is a mod file: each `mods/*.pw.toml` only
says where to download a mod from (CurseForge or Modrinth) and its checksum.

- `pack.toml` is the address players and the server point at.
- `side = "client"` mods are skipped on the server; everything else goes on both.
- Server-only jars (ServerCore, GML, Saplanting, Cerulean, Ember's Ancient Remnants) live only
  in the server's `mods` folder and are not listed here.

## Changing the pack

1. Edit or add a `mods/<name>.pw.toml`.
2. Recalculate `index.toml` and `pack.toml` (ask Claude, or run `packwiz refresh`).
3. Bump `version` in `pack.toml`, commit and push.
4. Players get it the next time they press Play; the server on its next restart.

`.gitattributes` keeps Git from changing line endings, because packwiz checks exact hashes.
