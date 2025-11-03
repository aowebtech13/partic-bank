var defaultHtmlHandler = (function() {
    "use strict";

    var config = {
        selectors: {
            acceptButtonSelector: "#cookies-accept-full",
            denyButtonSelector: "#cookies-deny",
            moreInfoButtonSelector: "#cookies-more-info",
            cookieFormSelector: "#cookie-form",
            cookieFormDenyButton: "#cookies-deny-button"
        }
    };

    function getCookieFormDiv() {
        var lightArticleElem = $(config.selectors.cookieFormSelector).parents(".articulo_ligero");
        var cookieFormDiv = $(config.selectors.cookieFormSelector).parent().parent();

        return lightArticleElem.length > 0 ? lightArticleElem : cookieFormDiv;
    }

    function showCookieForm() {
        getCookieFormDiv().show();
    }

    function hideCookieForm() {
        getCookieFormDiv().hide();
    }

    function acceptFullPolicy(buttonName) {
        CookiePolicy.buildPolicy(cookiesBanner.getCatalogUrl(), true, [])
            .then(function() {
            cookiesBanner.doTealiumCall(buttonName).then(function() {
                CookiePolicy.callCopy2DomainVoyagerMustShowFormExecutedSessionCookie();
            });
        }, function(error) {
            renderErrorDiv();
        });
    }

    // TODO: change this
    function renderErrorDiv() {
        var errorMessage = "No se han podido guardar tus preferencias sobre privacidad. Vuélvelo a intentar más tarde, por favor."
        var errorHtml = "<div id='cookie-banner-error-message'>" + errorMessage + "&nbsp;&nbsp;&nbsp;<span class='close-button'>x</span></div>";
        getCookieFormDiv().html(errorHtml);

        $("#cookie-banner-error-message .close-button").on("click", function(e) {
            $("#cookie-banner-error-message").parent().hide();
        });
    }


    function registerEvents() {
        $(config.selectors.acceptButtonSelector).on("click", function(e) {
            acceptFullPolicy($(config.selectors.acceptButtonSelector).children().attr("data-ref-origin"));
        });

        $(config.selectors.cookieFormDenyButton).on("click", function(e) {
            CookiePolicy.acceptOnlyTheEssentialCookies(cookiesBanner.getCatalogUrl(),renderErrorDiv);
        });

        $(config.selectors.moreInfoButtonSelector + ", " + config.selectors.denyButtonSelector)
            .on("click", function(e) {
            var url = $(e.target).prop("href");
            e.preventDefault();
            cookiesBanner.openMoreInfoPage(url);
        });
    }

    return {
        hideCookieForm: hideCookieForm,
        showCookieForm: showCookieForm,
        registerEvents: registerEvents,
    }

})();

var iframeHtmlHandler = (function() {

    "use strict";

    var config = {
        selectors: {
            iframeSelector: "iframe.cboxIframe",
            acceptButtonSelector: "#cookies-accept-full",
            denyButtonSelector: "#cookies-deny",
            moreInfoButtonSelector: "#cookies-more-info",
            cookieFormSelector: "#link_cookies a.cboxElement",
            cookieFormDenyButton: "#cookies-deny-button"
        }
    };

    function getCookieFormDiv() {
        var lightArticleElem = $(config.selectors.cookieFormSelector).parents(".articulo_ligero");
        var cookieFormDiv = $(config.selectors.cookieFormSelector).parent().parent();

        return lightArticleElem.length > 0 ? lightArticleElem : cookieFormDiv;
    }

    function colorboxCookies(cookieFormSelector) {
        $(cookieFormSelector).colorbox({
            open: true,
            iframe: true,
            transition: "fade",
            className: "popupCookies",
            closeButton: false,
            onComplete: function() {
                $('#colorbox').addClass('noClose').css("position", "fixed");
                $(config.selectors.iframeSelector).on('load', function() {
                    registerEventsAfterIframeIsLoaded();
                });

            },
            onClosed: function() {
                $('#colorbox').removeClass('noClose');
            }
        });

    }

    function showCookieForm() {
        if ($(config.selectors.cookieFormSelector).length > 0) {
            colorboxCookies(config.selectors.cookieFormSelector);
        }
    }

    function hideCookieForm() {
        // nothing to do
    }

    function registerEvents() {
        // nothing to do
    }

    function registerEventsAfterIframeIsLoaded() {
        var acceptButton = $(config.selectors.iframeSelector)
            .contents()
            .find(config.selectors.acceptButtonSelector);

        var denyButton = $(config.selectors.iframeSelector)
            .contents()
            .find(config.selectors.cookieFormDenyButton);

        acceptButton.on("click", function(e) {
            acceptFullPolicy(acceptButton.children().attr("data-ref-origin"));
        });

        denyButton.on("click", function(e) {
            CookiePolicy.acceptOnlyTheEssentialCookies(cookiesBanner.getCatalogUrl(),renderErrorDiv);
        });


        $(config.selectors.iframeSelector)
            .contents()
            .find(config.selectors.moreInfoButtonSelector + ", " + config.selectors.denyButtonSelector)
            .on("click", function(e) {
            var url = $(e.target).prop("href");
            e.preventDefault();
            cookiesBanner.openMoreInfoPage(url);
        });


    }

    function acceptFullPolicy(buttonName) {
        CookiePolicy.buildPolicy(cookiesBanner.getCatalogUrl(), true, [])
            .then(function() {
            cookiesBanner.doTealiumCall(buttonName).then(function() {
                CookiePolicy.callCopy2DomainVoyagerMustShowFormExecutedSessionCookie();
            });
        }, function(error) {
            renderErrorDiv();
        });
    }

    function renderErrorDiv() {
        var errorMessage = "No se han podido guardar tus preferencias sobre privacidad. Vuélvelo a intentar más tarde, por favor."
        var errorHtml = "<div id='cookie-banner-error-message'>" + errorMessage + "&nbsp;&nbsp;&nbsp;<span class='close-button'>x</span></div>";

        var iframeElem = $(config.selectors.iframeSelector).contents();
        iframeElem.find("body").html(errorHtml);

        iframeElem.find("#cookie-banner-error-message .close-button").on("click", function(e) {
            $(config.selectors.cookieFormSelector).colorbox.close();
        });
    }

    return {
        hideCookieForm: hideCookieForm,
        showCookieForm: showCookieForm,
        registerEvents: registerEvents
    }

})();

var cookiesBanner = (function() {

    "use strict";
    var defaultOptions = {
        catalogUrl: "/deployedfiles/common/aplnr/cookies/_caixabank_es_cookies.json",
        htmlHandler: "defaultHtmlHandler",
        daysToReloadIfCookiePolicyWasAcceptedPartially: 30
    };

    var options = {};

    function getCatalogUrl() {
       return options.catalogUrl;
    }


    function doTealiumCall(buttonName) {
        return CookiePolicy.getCookieCatalog(getCatalogUrl())
            .then(function(catalog) {
            var components = catalog["cookies"];
            var names = components.map(function(component) {
                return component.hasOwnProperty("siglaAnalitica") && component.siglaAnalitica !== "" ? component.siglaAnalitica : component.name;
            });

            var buttonActionName = "guardar";
            if (buttonName !== undefined) {
                buttonActionName = buttonName;
            }

            var componentsString = names.join("|");
            var cookieValue = "referrer:" + document.referrer + "|botonPulsado:" + buttonActionName + "|" + componentsString;
            CookiePolicy.setReferrerCookieAnalitica(cookieValue);
        });
    }

    function openMoreInfoPage(url) {
        var moreInfoPage = url;
        var thisPageUrl = window.location.href;
        var joinerChar = (moreInfoPage.indexOf("?") > -1) ? "&" : "?";
        var hashIndex = moreInfoPage.indexOf("#");
        var hash = "";

        if (hashIndex > -1) {
            hash = moreInfoPage.substring(hashIndex);
            moreInfoPage = moreInfoPage.substring(0, hashIndex);
        }

        var encodedThisPageUrl = encodeURIComponent(thisPageUrl);
        window.location = moreInfoPage + joinerChar + "originPage=" + encodedThisPageUrl + hash;
    }

    function getHtmlHandler() {
        if (options.htmlHandler === 'iframeHtmlHandler') {
            return iframeHtmlHandler;
        }
        return defaultHtmlHandler;
    }


    if (!String.prototype.endsWith) {
        String.prototype.endsWith = function(searchString, position) {
            var subjectString = this.toString();
            if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
                position = subjectString.length;
            }
            position -= searchString.length;
            var lastIndex = subjectString.indexOf(searchString, position);
            return lastIndex !== -1 && lastIndex === position;
        };
    }

    function init(opts) {
        $.extend(options, defaultOptions, opts);

        var htmlHandler = getHtmlHandler();

        htmlHandler.hideCookieForm();
        // see the email Miniaturas caixabank.com del buscador
        if(navigator.userAgent.indexOf("http://www.mindbreeze.com") === -1) {
            CookiePolicy.mustShowForm(getCatalogUrl(), 30, options.daysToReloadIfCookiePolicyWasAcceptedPartially).then(function (result) {
                if (result && NeoCookiePolicy.showGradually()) {
                    htmlHandler.showCookieForm();
                    htmlHandler.registerEvents();
                }
            });
        }

    }

    return {
        init: init,
        openMoreInfoPage: openMoreInfoPage,
        getCatalogUrl: getCatalogUrl,
        doTealiumCall: doTealiumCall,
    }

})();