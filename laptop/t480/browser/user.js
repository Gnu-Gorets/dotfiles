// Standart setup of LibreWolf

/** WebRTC ***/
user_pref("media.peerconnection.ice.relay_only", true);
user_pref("media.peerconnection.identity.timeout", 1);
user_pref("media.peerconnection.turn.disable", true);
user_pref("media.peerconnection.use_document_iceservers", false);

/** Geolocation ***/
user_pref("browser.geolocation.warning.infoURL", "");

/** Hardware devices ***/
user_pref("dom.gamepad.enabled", false);
user_pref("media.getusermedia.aec_enabled", false);
user_pref("media.getusermedia.agc_enabled", false);
user_pref("media.getusermedia.noise_enabled", false);
user_pref("media.getusermedia.screensharing.enabled", false);
user_pref("media.navigator.enabled", false);
user_pref("media.navigator.video.enabled", false);
user_pref("media.webspeech.synth.enabled", false);

/** Mozilla & Google  ***/
user_pref(
  "services.sync.prefs.sync.browser.safebrowsing.downloads.enabled",
  false,
);
user_pref(
  "services.sync.prefs.sync.browser.safebrowsing.malware.enabled",
  false,
);
user_pref("browser.safebrowsing.downloads.remote.block_dangerous", false);
user_pref("browser.safebrowsing.downloads.remote.block_dangerous_host", false);
user_pref(
  "browser.safebrowsing.downloads.remote.block_potentially_unwanted",
  false,
);
user_pref("browser.safebrowsing.downloads.remote.block_uncommon", false);
user_pref("browser.safebrowsing.downloads.remote.url", "");
user_pref("browser.safebrowsing.provider.google.lists", "");
user_pref("browser.safebrowsing.provider.google.reportURL", "");
user_pref("browser.safebrowsing.provider.mozilla.lists", "");
user_pref("browser.safebrowsing.provider.mozilla.updateURL", "");
user_pref("browser.safebrowsing.reportPhishURL", "");

/** Sync  ***/
user_pref("identity.fxaccounts.auth.uri", "");
user_pref("services.sync.engine.addons", false);
user_pref("services.sync.engine.addresses.available", false);
user_pref("services.sync.engine.bookmarks", false);
user_pref("services.sync.engine.history", false);
user_pref("services.sync.engine.prefs", false);
user_pref("services.sync.engine.tabs", false);

/** WebGL  ***/
user_pref("dom.enable_performance", false);
user_pref("dom.battery.enabled", false);

/** Caching in browser  ***/
user_pref("browser.cache.disk_cache_ssl", false);
user_pref("browser.cache.memory.enable", false);
user_pref("network.http.keep-alive.timeout", 600);
user_pref("network.http.max-persistent-connections-per-proxy", 16);
user_pref("network.protocol-handler.external-default", false);
user_pref("network.protocol-handler.external.mailto", false);
user_pref("network.protocol-handler.external.news", false);
user_pref("network.protocol-handler.external.nntp", false);
user_pref("network.protocol-handler.external.snews", false);
user_pref("network.protocol-handler.warn-external.file", true);
user_pref("network.protocol-handler.warn-external.mailto", true);
user_pref("network.protocol-handler.warn-external.news", true);
user_pref("network.protocol-handler.warn-external.nntp", true);
user_pref("network.protocol-handler.warn-external.snews", true);
user_pref("browser.sessionhistory.max_entries", 2);
user_pref("extensions.blocklist.enabled", false);

/** Other  ***/
user_pref("browser.urlbar.decodeURLsOnCopy", true);
user_pref("network.http.sendRefererHeader", 2);
user_pref("browser.urlbar.dnsResolveSingleWordsAfterSearch", 0);
user_pref("browser.display.use_document_fonts", 1);
user_pref("ui.key.menuAccessKey", 0);
user_pref("ui.key.menuAccessKeyFocuses", false);

user_pref("ImportEnterpriseRoots", true);
user_pref("accessibility.typeaheadfind.flashBar", 0);
user_pref("security.enterprise_roots.enabled", true);
user_pref("browser.download.autohideButton", true);
user_pref("browser.download.dir", "/home/$USER/Downloads/web");
user_pref("browser.download.folderList", 2);
user_pref("browser.download.lastDir", "/home/$USER/Downloads/web");
user_pref("browser.download.panel.shown", true);
user_pref("browser.engagement.ctrlTab.has-used", true);
user_pref("browser.engagement.downloads-button.has-used", true);
user_pref("browser.engagement.fxa-toolbar-menu-button.has-used", true);
user_pref("browser.newtab.extensionControlled", true);
user_pref("browser.newtab.privateAllowed", false);
user_pref("browser.protections_panel.infoMessage.seen", true);
user_pref("browser.startup.page", 3);
user_pref("browser.toolbars.bookmarks.visibility", "never");
user_pref("browser.translations.neverTranslateLanguages", "ru");
user_pref("browser.urlbar.shortcuts.bookmarks", false);
user_pref("browser.urlbar.shortcuts.history", false);
user_pref("browser.urlbar.shortcuts.tabs", false);
user_pref("browser.urlbar.suggest.bookmark", false);
user_pref("browser.urlbar.suggest.calculator", false);
user_pref("browser.urlbar.suggest.clipboard", false);
user_pref("browser.urlbar.suggest.engines", false);
user_pref("browser.urlbar.suggest.history", false);
user_pref("browser.urlbar.suggest.openpage", false);
user_pref("browser.urlbar.suggest.topsites", false);
user_pref("devtools.debugger.expressions-visible", true);
user_pref("devtools.debugger.pause-on-caught-exceptions", false);
user_pref("devtools.debugger.pending-selected-location", '{"url":""}');
user_pref("devtools.debugger.prefs-schema-version", 11);
user_pref("devtools.debugger.start-panel-size", 193);
user_pref("devtools.everOpened", true);
user_pref("devtools.performance.new-panel-onboarding", false);
user_pref("devtools.responsive.reloadNotification.enabled", false);
user_pref("devtools.responsive.viewport.width", 790);
user_pref("devtools.selfxss.count", 5);
user_pref("devtools.toolbox.host", "right");
user_pref("devtools.toolbox.previousHost", "bottom");
user_pref("devtools.toolbox.selectedTool", "jsdebugger");
user_pref("devtools.toolbox.sidebar.width", 1008);
user_pref("devtools.toolbox.splitconsole.open", true);
user_pref("devtools.toolbox.splitconsoleEnabled", true);
user_pref("devtools.toolbox.zoomValue", "1.3");
user_pref("devtools.toolsidebar-height.inspector", 712);
user_pref("devtools.toolsidebar-width.inspector", 700);
user_pref("devtools.toolsidebar-width.inspector.splitsidebar", 250);
user_pref("dom.security.https_only_mode", false);
user_pref("extensions.blocklist.pingCountVersion", -1);
user_pref(
  "extensions.pictureinpicture.enable_picture_in_picture_overrides",
  true,
);
user_pref("extensions.ui.dictionary.hidden", true);
user_pref("extensions.ui.extension.hidden", false);
user_pref("extensions.ui.lastCategory", "addons://list/extension");
user_pref("extensions.ui.locale.hidden", true);
user_pref("extensions.ui.sitepermission.hidden", true);
user_pref("extensions.webcompat.enable_shims", true);
user_pref("extensions.webcompat.perform_injections", true);
user_pref("extensions.webcompat.perform_ua_overrides", true);
user_pref("font.name.serif.x-western", "DroidSansM Nerd Font Mono");
user_pref("font.size.variable.x-western", 12);
user_pref("general.autoScroll", true);
user_pref("gfx.webrender.all", true);
user_pref("intl.regional_prefs.use_os_locales", true);
user_pref("layers.acceleration.force-enabled", true);
user_pref(
  "media.videocontrols.picture-in-picture.enable-when-switching-tabs.enabled",
  false,
);
user_pref("media.videocontrols.picture-in-picture.video-toggle.has-used", true);
user_pref("permissions.default.camera", 2);
user_pref("permissions.default.microphone", 2);
user_pref("permissions.default.xr", 2);
user_pref("pref.downloads.disable_button.edit_actions", false);
user_pref("pref.privacy.disable_button.cookie_exceptions", false);
user_pref("pref.privacy.disable_button.tracking_protection_exceptions", false);
user_pref("pref.privacy.disable_button.view_passwords", false);
user_pref("privacy.clearOnShutdown.cache", false);
user_pref("privacy.clearOnShutdown.cookies", false);
user_pref("privacy.clearOnShutdown.downloads", false);
user_pref("privacy.clearOnShutdown.formdata", false);
user_pref("privacy.clearOnShutdown.history", false);
user_pref("privacy.clearOnShutdown.offlineApps", false);
user_pref("privacy.clearOnShutdown.sessions", false);
user_pref("privacy.clearOnShutdown_v2.downloads", false);
user_pref("privacy.cpd.cookies", false);
user_pref("privacy.cpd.formdata", false);
user_pref("privacy.cpd.sessions", false);
user_pref("privacy.sanitize.sanitizeOnShutdown", false);
user_pref("security.disable_button.openCertManager", false);
user_pref("security.pki.mitm_canary_issuer", "O=mitmproxy,CN=mitmproxy");
user_pref("signon.management.page.breach-alerts.enabled", false);
user_pref("storage.vacuum.last.index", 2);
user_pref("svg.context-properties.content.enabled", true);

/** UI ***/
user_pref("browser.tabs.inTitlebar", 0);
user_pref("browser.uidensity", 1);
user_pref("browser.tabs.tabmanager.enabled", false);
user_pref("browser.newtabpage.activity-stream.showSearch", false);

/** Fonts ***/
user_pref("font.name.monospace.x-western", "DroidSansM Nerd Font Mono");
user_pref("font.name.sans-serif.x-western", "DroidSansM Nerd Font Mono");

/** Locale ***/
user_pref("intl.accept_languages", "en-US, en");
user_pref("javascript.use_us_english_locale", true);

/** Translations ***/
user_pref("browser.translations.enable", false);
user_pref("browser.translations.alwaysTranslateLanguages", "sr");

/** Network privacy ***/
user_pref("browser.region.network.url", "");
user_pref("browser.region.update.enabled", false);
user_pref("captivedetect.canonicalURL", "");
user_pref("network.captive-portal-service.enabled", false);
user_pref("network.connectivity-service.enabled", false);

/** Cookie banners ***/
user_pref("cookiebanners.service.mode", 1);
user_pref("cookiebanners.service.mode.privateBrowsing", 1);

/** Permissions ***/
user_pref("permissions.default.local-network", 2);
user_pref("permissions.default.localhost", 2);
user_pref("permissions.delegation.enabled", false);

/** URL bar extras ***/
user_pref("browser.urlbar.shortcuts.actions", false);
user_pref("browser.urlbar.suggest.quickactions", false);
user_pref("browser.urlbar.suggest.recentsearches", false);
user_pref("browser.urlbar.showSearchTerms.enabled", false);
user_pref("browser.urlbar.quicksuggest.dataCollection.enabled", false);
user_pref("browser.urlbar.trustPanel.featureGate", false);

/** Downloads ***/
user_pref("browser.download.useDownloadDir", true);

/** Fingerprinting ***/
user_pref("privacy.resistFingerprinting.exemptedDomains", "claude.ai");

/** Fullscreen ***/
user_pref("full-screen-api.warning.delay", -1);

/****************************************************************************
 * Betterfox                                                                *
 * "Ad meliora"                                                             *
 * version: 149                                                             *
 * url: https://github.com/yokoffing/Betterfox                              *
 ****************************************************************************/

/****************************************************************************
 * SECTION: FASTFOX                                                         *
 ****************************************************************************/
user_pref("gfx.canvas.accelerated.cache-size", 256); // reset pref

/****************************************************************************
 * SECTION: SECUREFOX                                                       *
 ****************************************************************************/
/** TRACKING PROTECTION ***/
user_pref("browser.contentblocking.category", "strict");
user_pref("browser.download.start_downloads_in_tmp_dir", true);
user_pref("browser.uitour.enabled", false);
user_pref("privacy.globalprivacycontrol.enabled", true);

/** OCSP & CERTS / HPKP ***/
user_pref("security.OCSP.enabled", 0);
user_pref("privacy.antitracking.isolateContentScriptResources", true);
user_pref("security.csp.reporting.enabled", false);

/** SSL / TLS ***/
user_pref("security.ssl.treat_unsafe_negotiation_as_broken", true);
user_pref("browser.xul.error_pages.expert_bad_cert", true);
user_pref("security.tls.enable_0rtt_data", false);

/** DISK AVOIDANCE ***/
user_pref("browser.cache.disk.enable", false);
user_pref("browser.privatebrowsing.forceMediaMemoryCache", true);
user_pref("media.memory_cache_max_size", 65536);
user_pref("browser.sessionstore.interval", 60000);

/** SHUTDOWN & SANITIZING ***/
user_pref("privacy.history.custom", true);
user_pref("browser.privatebrowsing.resetPBM.enabled", true);

/** SPECULATIVE LOADING ***/
user_pref("network.http.speculative-parallel-limit", 0);
user_pref("network.dns.disablePrefetch", true);
user_pref("network.dns.disablePrefetchFromHTTPS", true);
user_pref("browser.urlbar.speculativeConnect.enabled", false);
user_pref("browser.places.speculativeConnect.enabled", false);
user_pref("network.prefetch-next", false);

/** SEARCH / URL BAR ***/
user_pref("browser.urlbar.trimHttps", true);
user_pref("browser.urlbar.untrimOnUserInteraction.featureGate", true);
user_pref("browser.search.separatePrivateDefault.ui.enabled", true);
user_pref("browser.search.suggest.enabled", false);
user_pref("browser.urlbar.quicksuggest.enabled", false);
user_pref("browser.urlbar.groupLabels.enabled", false);
user_pref("browser.formfill.enable", false);
user_pref("network.IDN_show_punycode", true);

/** HTTPS-ONLY MODE ***/
user_pref("dom.security.https_only_mode_error_page_user_suggestions", true);

/** PASSWORDS ***/
user_pref("signon.formlessCapture.enabled", false);
user_pref("signon.privateBrowsingCapture.enabled", false);
user_pref("network.auth.subresource-http-auth-allow", 1);
user_pref("editor.truncate_user_pastes", false);

/** EXTENSIONS ***/
user_pref("extensions.enabledScopes", 5);

/** HEADERS / REFERERS ***/
user_pref("network.http.referer.XOriginTrimmingPolicy", 2);

/** CONTAINERS ***/
user_pref("privacy.userContext.ui.enabled", true);

/** VARIOUS ***/
user_pref("pdfjs.enableScripting", false);

/** SAFE BROWSING ***/
user_pref("browser.safebrowsing.downloads.remote.enabled", false);

/** MOZILLA ***/
user_pref("permissions.default.desktop-notification", 2);
user_pref("permissions.default.geo", 2);
user_pref("geo.provider.network.url", "https://beacondb.net/v1/geolocate");
user_pref("browser.search.update", false);
user_pref("permissions.manager.defaultsUrl", "");
user_pref("extensions.getAddons.cache.enabled", false);

/** TELEMETRY ***/
user_pref("datareporting.policy.dataSubmissionEnabled", false);
user_pref("datareporting.healthreport.uploadEnabled", false);
user_pref("toolkit.telemetry.unified", false);
user_pref("toolkit.telemetry.enabled", false);
user_pref("toolkit.telemetry.server", "data:,");
user_pref("toolkit.telemetry.archive.enabled", false);
user_pref("toolkit.telemetry.newProfilePing.enabled", false);
user_pref("toolkit.telemetry.shutdownPingSender.enabled", false);
user_pref("toolkit.telemetry.updatePing.enabled", false);
user_pref("toolkit.telemetry.bhrPing.enabled", false);
user_pref("toolkit.telemetry.firstShutdownPing.enabled", false);
user_pref("toolkit.telemetry.coverage.opt-out", true);
user_pref("toolkit.coverage.opt-out", true);
user_pref("toolkit.coverage.endpoint.base", "");
user_pref("browser.newtabpage.activity-stream.feeds.telemetry", false);
user_pref("browser.newtabpage.activity-stream.telemetry", false);
user_pref("datareporting.usage.uploadEnabled", false);

/** EXPERIMENTS ***/
user_pref("app.shield.optoutstudies.enabled", false);
user_pref("app.normandy.enabled", false);
user_pref("app.normandy.api_url", "");

/** CRASH REPORTS ***/
user_pref("breakpad.reportURL", "");
user_pref("browser.tabs.crashReporting.sendReport", false);

/****************************************************************************
 * SECTION: PESKYFOX                                                        *
 ****************************************************************************/
/** MOZILLA UI ***/
user_pref("extensions.getAddons.showPane", false);
user_pref("extensions.htmlaboutaddons.recommendations.enabled", false);
user_pref("browser.discovery.enabled", false);
user_pref("browser.shell.checkDefaultBrowser", false);
user_pref(
  "browser.newtabpage.activity-stream.asrouter.userprefs.cfr.addons",
  false,
);
user_pref(
  "browser.newtabpage.activity-stream.asrouter.userprefs.cfr.features",
  false,
);
user_pref("browser.preferences.moreFromMozilla", false);
user_pref("browser.aboutConfig.showWarning", false);
user_pref("browser.startup.homepage_override.mstone", "ignore");
user_pref("browser.aboutwelcome.enabled", false);
user_pref("browser.profiles.enabled", true);

/** THEME ADJUSTMENTS ***/
user_pref("toolkit.legacyUserProfileCustomizations.stylesheets", true);
user_pref("browser.compactmode.show", true);
user_pref("browser.privateWindowSeparation.enabled", false); // WINDOWS

/** AI ***/
user_pref("browser.ai.control.default", "blocked");
user_pref("browser.ml.enable", false);
user_pref("browser.ml.chat.enabled", false);
user_pref("browser.ml.chat.menu", false);
user_pref("browser.tabs.groups.smart.enabled", false);
user_pref("browser.ml.linkPreview.enabled", false);

/** FULLSCREEN NOTICE ***/
user_pref("full-screen-api.transition-duration.enter", "0 0");
user_pref("full-screen-api.transition-duration.leave", "0 0");
user_pref("full-screen-api.warning.timeout", 0);

/** URL BAR ***/
user_pref("browser.urlbar.trending.featureGate", false);

/** NEW TAB PAGE ***/
user_pref("browser.newtabpage.activity-stream.default.sites", "");
user_pref("browser.newtabpage.activity-stream.showSponsoredTopSites", false);
user_pref("browser.newtabpage.activity-stream.feeds.section.topstories", false);
user_pref("browser.newtabpage.activity-stream.showSponsored", false);
user_pref("browser.newtabpage.activity-stream.showSponsoredCheckboxes", false);

/** DOWNLOADS ***/
user_pref("browser.download.manager.addToRecentDocs", false);

/** PDF ***/
user_pref("browser.download.open_pdf_attachments_inline", true);

/** TAB BEHAVIOR ***/
user_pref("browser.bookmarks.openInTabClosesMenu", false);
user_pref("browser.menu.showViewImageInfo", true);
user_pref("findbar.highlightAll", true);
user_pref("layout.word_select.eat_space_to_next_word", false);

/****************************************************************************
 * SECTION: SMOOTHFOX                                                       *
 ****************************************************************************/
// visit https://github.com/yokoffing/Betterfox/blob/main/Smoothfox.js
// Enter your scrolling overrides below this line:

/****************************************************************************
 * END: BETTERFOX                                                           *
 ****************************************************************************/
