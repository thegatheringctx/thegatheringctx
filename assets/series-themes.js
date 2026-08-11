/* ============================================================
   The Gathering CTX - Series (per-book) themes
   One place that maps a sermon/devotional series to a header
   theme, so every book we preach gets its own look. Used by both
   devotional-template.html and sermon-template.html.

   window.SeriesThemes.get(seriesName, overrideFromJSON) -> {bg, accent, image?}
     bg     : CSS background for the hero (a tasteful dark gradient)
     accent : the label / rule / highlight color for that book
     image  : optional header image URL (from the JSON's "headerImage")

   To give a new book its own look, add an entry below keyed by a
   lowercase word that appears in the series name.
   ============================================================ */
(function () {
  var THEMES = {
    // Colossians - the supremacy of Christ, "all of Him": deep cosmic violet.
    colossians: {
      bg: "radial-gradient(ellipse at 50% -10%, rgba(124,84,200,0.28), transparent 60%), linear-gradient(165deg,#1a1338 0%,#0c0a1e 100%)",
      accent: "#c3a0ea"
    },
    // Ephesians - seated in heavenly places, the armor of God: royal blue + gold.
    ephesians: {
      bg: "radial-gradient(ellipse at 50% -10%, rgba(74,120,200,0.26), transparent 60%), linear-gradient(165deg,#0f2036 0%,#080f1c 100%)",
      accent: "#e2c469"
    },
    // Philippians - joy in chains: warm sunrise amber.
    philippians: {
      bg: "radial-gradient(ellipse at 50% -10%, rgba(214,130,58,0.24), transparent 60%), linear-gradient(165deg,#2a1a10 0%,#150c07 100%)",
      accent: "#eaa85c"
    },
    // Pentecost - the fire fell: ember red/gold.
    pentecost: {
      bg: "radial-gradient(ellipse at 50% -10%, rgba(210,80,50,0.26), transparent 60%), linear-gradient(165deg,#2a120e 0%,#140805 100%)",
      accent: "#f0a24a"
    },
    // Easter - resurrection dawn: soft gold on deep green.
    easter: {
      bg: "radial-gradient(ellipse at 50% -10%, rgba(120,170,110,0.22), transparent 60%), linear-gradient(165deg,#122318 0%,#0a130d 100%)",
      accent: "#dfc06a"
    },
    _default: {
      bg: "radial-gradient(ellipse at 50% -10%, rgba(184,147,90,0.16), transparent 60%), linear-gradient(165deg,#161210 0%,#0a0908 100%)",
      accent: "#b8935a"
    }
  };

  function keyFor(series) {
    if (!series) return "_default";
    var s = String(series).toLowerCase();
    for (var k in THEMES) {
      if (k !== "_default" && s.indexOf(k) >= 0) return k;
    }
    return "_default";
  }

  window.SeriesThemes = {
    get: function (series, override) {
      var base = THEMES[keyFor(series)];
      var t = { bg: base.bg, accent: base.accent };
      if (override) {
        if (override.bg) t.bg = override.bg;
        if (override.accent) t.accent = override.accent;
        if (override.image) t.image = override.image;
      }
      return t;
    }
  };
})();
