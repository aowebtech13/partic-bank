var lQuery;
var oQuery;

var LOLOPOLogging = (function() {

    var _configs = {};
    var _defaultConfigs = {
        isServerLogEnabled: true,
        serverAllowedLevels: ['error'],

        serverApi: {
            errorControlParams: {
                tags: ["LOLOPO","PORTAL"],
                contract: "LOLOPO",
                project: "LOLOPO",
                breadcrumb: [document.title]
            },
            apiKey: "P18091",
            serviceURL: "//loapp.caixabank.es/log1ku/rest/logger/save",
            nodeSrc: "//loapp.caixabank.es/js/lomilu/errorControl.js"
        }
    };

    function debug() {
        handleMessage('debug', arguments);
    }

    function log() {
        handleMessage('log', arguments);
    }

    function info() {
        handleMessage('info', arguments);
    }

    function warn() {
        handleMessage('warn', arguments);
    }

    function error() {
        handleMessage('error', arguments);
    }

    function handleMessage(level, args) {
        if (_configs.isServerLogEnabled) {
            if (_configs.serverAllowedLevels.indexOf(level) > - 1) {
                serverLog(level, args);
            }
        } else {
            localLog(level, args);
        }
    }

    function localLog(level, args) {
        console[level].apply(this, args);
    }

    function initLogServerApi() {
        if (!window.errorControl) {
            var node = document.createElement("script");
            var firstTag = document.getElementsByTagName("script")[0];
            node.async = 1;
            window.eC_errorControlParams = {
                tags: _configs.serverApi.errorControlParams.tags,
                contrato: _configs.serverApi.errorControlParams.contract,
                proyecto: _configs.serverApi.errorControlParams.project,
                breadcrumb: _configs.serverApi.errorControlParams.breadcrumb
            };
            window.eC_apiKey = _configs.serverApi.apiKey;
            window.eC_serviceURL = _configs.serverApi.serviceURL;
            node.src = _configs.serverApi.nodeSrc;
            firstTag.parentNode.insertBefore(node, firstTag);
        }
    }

    function serverLog(level, args) {
        var allowedLevels = ["error", "warn", "log"];

        var message = "[" + level + "] ";

        for (var i = 0; i < args.length; i++) {
            message += args[i] + "; ";
        }

        if (allowedLevels.indexOf(level) === -1) {
            info("Message with log level '" + level + "' will not  be logged to server. Message is: " + message);
            return;
        }

        if (typeof errorControl !== 'undefined') {
            errorControl[level]({
                message: message
            });
        } else {
            console.log("errorControl function is not available. Message to log was: " + message);
        }
    }

    function init(configs) {
        configs = typeof configs !== "undefined" ? configs : {};

        _configs = lQuery.extend(true, {}, _defaultConfigs, configs);

        initLogServerApi();
    }

    return {
        init: init,
        debug: debug,
        log: log,
        info: info,
        warn: warn,
        error: error
    };

})();
function trapTabKeylolopo(obj, evt) {

    var focusableElementsString = "a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]";

    // if tab or shift-tab pressed
    if (evt.which == 9) {

        // get list of all children elements in given object
        var o = obj.find('*');

        // get list of focusable items
        var focusableItems;
        focusableItems = o.filter(focusableElementsString).filter(':visible');
        console.log(focusableItems);

        // get currently focused item
        var focusedItem;
        focusedItem = lQuery(':focus');
        console.log(focusedItem);

        // get the number of focusable items
        var numberOfFocusableItems;
        numberOfFocusableItems = focusableItems.length;
        console.log(numberOfFocusableItems);

        // get the index of the currently focused item
        var focusedItemIndex;
        focusedItemIndex = focusableItems.index(focusedItem);

        if (evt.shiftKey) {
            //back tab
            // if focused on first item and user preses back-tab, go to the last focusable item
            if (focusedItemIndex == 0) {
                focusableItems.get(numberOfFocusableItems - 1).focus();
                evt.preventDefault();
            }

        } else {
            //forward tab
            // if focused on the last item and user preses tab, go to the first focusable item
            if (focusedItemIndex == numberOfFocusableItems - 1) {
                focusableItems.get(0).focus();
                evt.preventDefault();
            }
        }
    }

}
function getLanguagesLolopo(){
    var langParent=lQuery('html').attr('lang');
    return langParent;
}

var LOLOPORender = (function () {

    var logger = LOLOPOLogging;

    function showToolpitWithKeyboard(){
        let acceso = document.getElementById("accessCBN");
        let ttip = document.getElementsByClassName("lolopo-tooltip");
        if(acceso !== null) {
            acceso.addEventListener("focus", () => {
                if(ttip !== null) {
                    ttip[0].classList.remove('hidden');
                    ttip[0].setAttribute("aria-hidden", false);
                }
            });
        }
        if(acceso !== null) {
            acceso.addEventListener("blur", () => {
                if(ttip !== null) {
                    ttip[0].classList.add('hidden');
                    ttip[0].setAttribute("aria-hidden", true);
                }
            });
        }

    }

    function renderMustache(elem, template, data) {
        var rendered = Mustache.render(template, data);
        lQuery(elem).append(rendered);
    }

    // TODO: review this function
    function render(lolopoElem, renderConfigs) {
        var deferred = lQuery.Deferred();

        lQuery.get(renderConfigs.template)
            .then(function(template) {
                lQuery.getJSON(renderConfigs.jsonData, function(data) {
                    renderMustache(lolopoElem, template, data);
                    showToolpitWithKeyboard();
                    logger.debug("Successfully rendered mustache template");
                    deferred.resolve("Successfully rendered mustache template");
                }).fail(function() {
                    var error = 'Failed to load data file for mustache template: ' + renderConfigs.jsonData;
                    logger.error(error);
                    deferred.reject(error);
                });
            }).fail(function() {
            var error = 'Failed to load mustache template: ' + renderConfigs.template;
            logger.error(error);
            deferred.reject(error);
        });

        return deferred.promise();
    }

    function init(selector, renderConfigs) {
        if (typeof selector === "undefined") {
            logger.error("A valid selector must be provided");
            return 1;
        }

        renderConfigs = typeof renderConfigs !== "undefined" ? renderConfigs : {};

        var defaultConfigs = {
            template: "lolopo-default.mustache",
            jsonData: "lolopo-view-data-es.json"
        };

        renderConfigs = lQuery.extend(true, {}, defaultConfigs, renderConfigs);
        return render(selector, renderConfigs);
    }

    return {
        init: init
    };

})();

var LOLOPOModule = (function () {

    'use strict';

    var HIDDEN_FORM_DATA = [{
        name: 'FLAG_DEMO',
        value: '0'
    }, {
        name: 'FLAG_PART_EMPR',
        value: 'P'
    }, {
        name: 'TIPUS_IDENT',
        value: '2'
    }, {
        name: 'D',
        value: ''
    }, {
        name: 'E',
        value: ''
    }, {
        name: 'PN',
        value: 'LGN'
    }, {
        name: 'PE',
        value: '8'
    }];

    var EVENTS = {
        LGN24_LOADED: "lolopo.lgn24.loaded"
    };

    var KEYS = {
        enter: 13,
        space: 32,
        down: 40
    };

    var logger = LOLOPOLogging;

    var _defaultLibURLs = {
        jQueryURL: "/deployedfiles/common/R2016/Estaticos/js/lib/jquery-latest.min.js",
        mustacheURL: "/deployedfiles/common/R2016/Estaticos/js/lib/mustache.min.js"
    };

    var _configs = {};
    var _defaultConfigs = {
        LGN24Url: "https://lo.caixabank.es/GPeticiones?PN=LGN&PE=24&IDIOMA=02&CANAL=I&DEMO=0&FLAG_BORSA=0&CS=UTF",

        submitFormTimeout: 60000,

        userInputNameAttribute: "usuari",
        passwordInputNameAttribute: "password",
        loginInputNameAttribute: "login",

        selectors: {
            lolopoForm: ".lolopo-form",
            lolopoSpinner: ".lolopo-spinner",
            lolopoNotices: ".lolopo-notices",
            message: ".lolopo-notices .message",
            messageAccept: ".lolopo-notices .alert .button_wrap a",
            messageDismiss: ".lolopo-notices .alert .close",
            keyboardImgAnchor: "#keyboardAnchor img",
            keyboardAnchor: "#keyboardAnchor",
            messages: {
                notAvailable: "#notAvailable",
                invalidUserData: "#invalidUserData"
            }
        },

        forgotPasswordWindow: {
            URL: "https://lo.caixabank.es/GPeticiones?PN=RPL&PE=21&IDIOMA=02&CANAL=I&DEMO=0&ENTORNO=1",
            name: "r_PIN1",
            specs: "width=850,height=800,scrollbars=yes,status=yes,resizable=yes,toolbar=yes,location=0,menubar=no"
        },

        testScriptsLoading: false
    };

    var _isLGN24Loaded = false,
        _isLoadingLGN24 = false,
        _isLOLOPOWaiting = false;


    function getInputElemByName(name) {
        return lQuery(_configs.selectors.lolopoForm).find('input[name=' + '"' + name + '"]');
    }

    function areInputFieldsEmpty() {
        var user = getInputElemByName(_configs.userInputNameAttribute).val();
        var pin = getInputElemByName(_configs.passwordInputNameAttribute).val();

        return user === "" || pin === "";
    }

    function submitLoginForm() {
        if (typeof neoEventSC === 'function') {
            neoEventSC(pageNameValue + ':' + 'Cabecera' + ':' + ' AccesoLOLOPO ', pageNameValue +',' + 'click en' + ' ' + 'Cabecera' + ',' + 'AccesoLOLOPO' );
        }        
        if (areInputFieldsEmpty()) {
            showKeyboard();
        } else {
            _isLOLOPOWaiting = true;
            var timeout = _configs.submitFormTimeout;
            setTimeout(function() {
                waitTimeout(timeout);
            }, timeout);

            if (!_isLGN24Loaded) {
                lQuery("body")
                    .off(EVENTS.LGN24_LOADED)
                    .on(EVENTS.LGN24_LOADED, submitLoginFormReady);
                lQuery(_configs.selectors.lolopoSpinner).show();
            } else {
                submitLoginFormReady();
            }
        }
    }

    function submitLoginFormReady() {
        lQuery(_configs.selectors.lolopoSpinner).hide();
        submitForm();
    }

    function submitForm() {
        var user = getInputElemByName(_configs.userInputNameAttribute).val();
        var pin = getInputElemByName(_configs.passwordInputNameAttribute).val();

        getInputElemByName(_configs.userInputNameAttribute).val("");
        getInputElemByName(_configs.passwordInputNameAttribute).val("");

        getInputElemByName("u").val(user);
        getInputElemByName("p").val(pin);


        getInputElemByName(_configs.loginInputNameAttribute).prop('disabled', true);

        if (isValidEntry(user, pin)) {
            var encodedPin = encodePin(pin);
            var hiddenForm = createHiddenLoginForm(dominio, wblSession, user, encodedPin);
            lQuery('body').append(hiddenForm);
            hiddenForm.submit();
        } else {
            resetFormAndShowMessage(_configs.selectors.messages.invalidUserData);
        }
    }

    function encodePin(pin) {
        // function loaded from LGN24
        return CodificaPIN(pin);
    }

    function createHiddenLoginForm(domain, session, user, pinenc) {
        var newForm = lQuery('<form>', {
            action: domain + "GPeticiones" + session,
            target: '_top',
            method: 'POST',
            name: 'LGN'
        });

        HIDDEN_FORM_DATA.forEach(function (elem) {
            newForm.append(lQuery('<input>', {
                name: elem.name,
                value: elem.value,
                type: 'hidden'
            }));
        });

        newForm.find('input[name="E"]').val(user);
        newForm.find('input[name="D"]').val(pinenc);

        return newForm;
    }

    function isValidEntry(user, pin) {
        // function loaded from LGN24
        return esEntradaValida(user, pin);
    }

    function showKeyboard() {
        lQuery(_configs.selectors.keyboardImgAnchor).trigger('click');
    }

    function resetFormAndShowMessage(messageSelector) {
        lQuery(_configs.selectors.lolopoSpinner).hide();

        showLOLOPOMessage(messageSelector);

        getInputElemByName(_configs.loginInputNameAttribute).prop('disabled', false);
        getInputElemByName(_configs.userInputNameAttribute).val('');
        getInputElemByName(_configs.passwordInputNameAttribute).val('');
    }

    function notAvailable() {
        resetFormAndShowMessage(_configs.selectors.messages.notAvailable);
    }

    function waitTimeout(timeoutWaited) {
        if (_isLOLOPOWaiting) {
            lQuery("body").off(EVENTS.LGN24_LOADED);
            logger.error("Timeout occurred while waiting for LGN24 script to be loaded. Waited " +
                timeoutWaited + " ms");
            notAvailable();
        }

        _isLOLOPOWaiting = false;
    }

    function forgotPassword() {
        window.name = "portal";

        var conf = _configs.forgotPasswordWindow;
        var remote = window.open(conf.URL, conf.name, conf.specs);

        if (remote.opener === null) {
            remote.opener = window;
        }

        remote.opener.name = "portal";
    }

    function xSetPrefixCookie(date) {
        var domain = getDomain();

        var cookieData = {
            prefix: "PART",
            expires: date,
            domain: domain,
            path: "/"
        };

        setCookie(cookieData);
    }

    function xSetLoginCookie() {
        var user = getInputElemByName(_configs.userInputNameAttribute).val();
        var pass = getInputElemByName(_configs.passwordInputNameAttribute).val();

        if (user !== "" && pass !== "") {
            var expireDate = new Date();
            expireDate.setTime(expireDate.getTime() + 3600 * 1000 * 24 * 30);

            var cookieData = {
                blo: "blo",
                expires: expireDate,
                path: "/",
                secure: ""
            };

            setCookie(cookieData);
        }
    }

    function setCookie(cookieData) {
        var cookieString = "";
        var expires = "";

        if (cookieData.hasOwnProperty('expires')) {
            var date = cookieData.expires;
            expires = date.toGMTString(date.getTime());
        }

        for (var key in cookieData) {
            if (cookieData.hasOwnProperty(key)) {
                var value = cookieData[key];
                if (key === "expires") {
                    value = expires;
                }

                cookieString += key + "=" + value + "Secure; ";
            }
        }

        document.cookie = cookieString;
    }

    function getDomain() {
        var index = location.hostname.indexOf(".");

        if (index === -1) {
            return location.hostname;
        }

        return location.hostname.substring(index, location.hostname.length);
    }

    function showLOLOPOMessage(messageSelector) {
        var message = lQuery(messageSelector).text();
        var acceptAndCloseElems = lQuery(_configs.selectors.messageAccept + ", " + _configs.selectors.messageDismiss);

        logger.log("Show LOLOPO Message: " + message);

        acceptAndCloseElems.on('click', removeMessageCallback);
        acceptAndCloseElems.on("keydown", removeMessageKeydownCallback);

        lQuery(_configs.selectors.message).html(message);
        lQuery(_configs.selectors.lolopoNotices).show();

        logger.error("The following message was sent to user interface: ", message);
    }

    function removeMessageCallback(event) {
        event.preventDefault();
        lQuery(_configs.selectors.message).empty();
        lQuery(_configs.selectors.lolopoNotices).hide();
    }

    function removeMessageKeydownCallback(event) {
        var keys = [ KEYS.enter, KEYS.space, KEYS.down ];
        var pressedKey = event.keyCode;

        if (keys.indexOf(pressedKey) !== -1) {
            removeMessageCallback(event);
        }
    }

    function validateEnter(e) {
        var key = e.keyCode || e.which;
        if (key == KEYS.enter) {
            submitLoginForm();
            return false;
        }
    }

    function isCaContext(){
        var m = document.getElementsByTagName('meta');
        for(var i in m){if(!!m[i].name && m[i].name.toLowerCase() == 'language' && !!m[i].content && m[i].content.toLowerCase() == 'ca' ){return true;}}
        if(document.location.href.toLowerCase().lastIndexOf("_ca.html")!=-1){return true;}
        return false;
    }

    function transformLGNURI(url){
        if(isCaContext()){
            return url + "&URL_DESC=https%3A%2F%2Fwww.caixabank.cat%2Fparticular%2Flow%2Fdescon_low.html&ENTORNO=L";
        }else{
            return url;
        }
    }

    // guarantees LGN24 is only loaded once
    function loadLGN24() {
        logger.debug("On load LGN24 function.");
        if (!_isLGN24Loaded && !_isLoadingLGN24) {
            _isLoadingLGN24 = true;
            return loadScript(transformLGNURI(_configs.LGN24Url))
                .then(function(response) {
                    _isLoadingLGN24 = false;
                    _isLGN24Loaded = true;
                    lQuery("body").trigger(EVENTS.LGN24_LOADED);
                    logger.info("LGN24 was loaded!");
                }, function(error) {
                    logger.error("LGN24 script could not be loaded");
                });
        } else {
            logger.debug("Will not load LGN24. LGN24 is already loaded/being loaded!");
            return lQuery.Deferred();
        }
    }

    function loadScript(url, success) {
        logger.debug("On loadScript function. URL is: ", url);
        var deferred = lQuery.Deferred();

        var requestScript = function() {
            lQuery.ajax({
                url: url,
                dataType: "script",
                success: success,
                cache: true,
                error: function (error) {
                    logger.error("Error loading script: ", error);
                }
            }).then(function (data) {
                deferred.resolve(data);
            }, function (error) {
                deferred.reject("Error on loading script. Url is: " + url + "Error: " + error);
            });
        };

        // setTimeout. only used to increase load time, simulating a slow network
        if (_loadingScriptsTestConfigs.isLoadingScriptsTestEnabled) {
            setTimeout(function() {
                logger.debug('Inside "load script" timeout');
                requestScript();
            }, _loadingScriptsTestConfigs.loadScriptTimeout);
        } else {
            requestScript();
        }

        return deferred.promise();
    }

    function handleFillUserPassword(event) {
        loadLGN24();
        validateEnter(event);
    }

    function registerFormEvents() {
        var submitInputElem = getInputElemByName(_configs.loginInputNameAttribute);
        var userInputElem = getInputElemByName(_configs.userInputNameAttribute);
        var passInputElem = getInputElemByName(_configs.passwordInputNameAttribute);
        var keyboardElem = lQuery(_configs.selectors.keyboardAnchor);

        submitInputElem.on('click', submitLoginForm);
        userInputElem.on('change keypress', handleFillUserPassword);
        passInputElem.on('change keypress', handleFillUserPassword);
        keyboardElem.on('click', openKeyboardIframeModal);
    }

    function getSpinnerHtml() {
        var spinnerInnerDivs = "";
        for (var i = 0; i < 12; i++) {
            spinnerInnerDivs += "<div></div>";
        }
        return "<div class='lds-spinner'>" + spinnerInnerDivs + "</div>";
    }

    function closeKeyboardIframeModal(event) {
        lQuery("#iframe-modal").hide();
        lQuery("#iframe-modal-content").hide();
        lQuery("#iframe-content").html("");
        lQuery('#iframe-modal').attr("aria-hidden","true");

        lQuery('#header .header-topbar').removeAttr("aria-hidden");
        lQuery('#header .header-bottom .col-xs-4').removeAttr("aria-hidden");

        lQuery('#header .header-bottom .col-xs-12 #hc-header-mobile-link').removeAttr("aria-hidden");
        lQuery('#header .header-bottom .col-xs-12 #la-header-mobile-button').removeAttr("aria-hidden");
        lQuery('#header .header-bottom .col-xs-12 #lolopo #lolopo-template #iframe-modal').siblings().removeAttr("aria-hidden");

        lQuery('.panels').removeAttr("aria-hidden");
        lQuery('.cookies-region').removeAttr("aria-hidden");
        lQuery('#page').removeAttr("aria-hidden");

    }
    function receiveMessageLolopo(event) {
        if (event.origin == "https://loc.caixabank.es" || event.origin == "https://loc1.caixabank.es"|| event.origin == "https://loc2.caixabank.es" || event.origin == "https://loc3.caixabank.es" || event.origin == "https://loc4.caixabank.es" || event.origin == "https://loc5.caixabank.es" || event.origin == "https://loc6.caixabank.es" || event.origin == "https://loc7.caixabank.es" || event.origin == "https://loc8.caixabank.es" || event.origin == "https://loc9.caixabank.es" || event.origin == "https://loc10.caixabank.es" ) {
            console.log("recibe el mensaje");
            lQuery("#iframe-modal").hide();
            lQuery("#iframe-modal-content").hide();
            lQuery("#iframe-content").html("");
            lQuery('#iframe-modal').attr("aria-hidden","true");

            lQuery('#header .header-topbar').removeAttr("aria-hidden");
            lQuery('#header .header-bottom .col-xs-4').removeAttr("aria-hidden");

            lQuery('#header .header-bottom .col-xs-12 #hc-header-mobile-link').removeAttr("aria-hidden");
            lQuery('#header .header-bottom .col-xs-12 #la-header-mobile-button').removeAttr("aria-hidden");
            lQuery('#header .header-bottom .col-xs-12 #lolopo #lolopo-template #iframe-modal').siblings().removeAttr("aria-hidden");

            lQuery('.panels').removeAttr("aria-hidden");
            lQuery('.cookies-region').removeAttr("aria-hidden");
            lQuery('#page').removeAttr("aria-hidden");

        }
    }
    window.addEventListener("message", receiveMessageLolopo, false);
    function createKeyboardIframe(url) {
        return lQuery('<iframe>', {
            src: url,
            id: 'keyboard-iframe',
            width: '100%',
            height: '90%',
            frameborder: 0
        });
    }

    function createKeyboardIframeModal() {
        var iFrameModal = lQuery('<div>', {
            id: 'iframe-modal',
            class: 'modal'
        });

        var iFrameModalContent = lQuery('<div>', {
            id: 'iframe-modal-content',
            class: 'modal-content',
            style: 'display: none'
        });

        var close = lQuery('<span class="cboxClose close" tabindex="0">&times;</span>');
        var iFrameContent = lQuery('<div id="iframe-content" style="width: 100%; height: 100%"></div>');
        var linkCloseES=lQuery("<a href='javascript:void(0)' class='sr-only' onclick='lQuery(\".cboxClose\").focus();'>Ir al cierre</a>");
        var linkCloseCA=lQuery("<a href='javascript:void(0)' class='sr-only' onclick='lQuery(\".cboxClose\").focus();'>Anar al tancament</a>");
        var linkCloseEU=lQuery("<a href='javascript:void(0)' class='sr-only' onclick='lQuery(\".cboxClose\").focus();'>Joan itxiera</a>");
        var linkCloseGA=lQuery("<a href='javascript:void(0)' class='sr-only' onclick='lQuery(\".cboxClose\").focus();'>Ir ao peche</a>");
        var linkCloseVA=lQuery("<a href='javascript:void(0)' class='sr-only' onclick='lQuery(\".cboxClose\").focus();'>Anar al tancament</a>");
        var linkCloseDE=lQuery("<a href='javascript:void(0)' class='sr-only' onclick='lQuery(\".cboxClose\").focus();'>Zum Schluss gehen</a>");
        var linkCloseEN=lQuery("<a href='javascript:void(0)' class='sr-only' onclick='lQuery(\".cboxClose\").focus();'>Go to the closing</a>");
        var linkCloseFR=lQuery("<a href='javascript:void(0)' class='sr-only' onclick='lQuery(\".cboxClose\").focus();'>Aller à la fermeture</a>");

        iFrameModalContent
            .append(close)
            .append(iFrameContent)

        var nameLanguage=getLanguagesLolopo();
        if(nameLanguage==='es'){

            iFrameModalContent.append(linkCloseES);

        }else if(nameLanguage==='ca'){

            iFrameModalContent.append(linkCloseCA);

        }else if(nameLanguage==='eu'){

            iFrameModalContent.append(linkCloseEU);

        }else if(nameLanguage==='gl'){

            iFrameModalContent.append(linkCloseGA);

        }else if(nameLanguage==='va'){

            iFrameModalContent.append(linkCloseVA);

        }else if(nameLanguage==='de'){

            iFrameModalContent.append(linkCloseDE);

        }else if(nameLanguage==='fr'){

            iFrameModalContent.append(linkCloseFR);
        }else{
            iFrameModalContent.append(linkCloseEN);
        }


        var iFrameSpinner = lQuery('<div>', {
            id: 'iframe-spinner'
        });

        var innerIFrameSpinner = lQuery('<div>', {
            class: 'lds-spinner'
        });


        var innerDivs = "";
        for (var i = 0; i < 12; i++) {
            innerDivs += "<div></div>";
        }
        innerIFrameSpinner.append(innerDivs);
        iFrameSpinner.append(innerIFrameSpinner);

        iFrameModal
            .append(iFrameModalContent)
            .append(iFrameSpinner);


        lQuery("#lolopo-template").append(iFrameModal);

        lQuery("#iframe-modal .close")
            .off("click")
            .on("click", closeKeyboardIframeModal);
    }


    function openKeyboardIframeModal(event) {
        event.preventDefault();

        var elem = lQuery(_configs.selectors.keyboardAnchor);
        var href = elem.attr("href");
        var iframe = createKeyboardIframe(href);

        lQuery("#iframe-spinner").show();
        lQuery("#iframe-modal").show();
        lQuery("#iframe-content").append(iframe);

        iframe.off("load").on("load", function() {
            lQuery("#iframe-spinner").hide();
            lQuery("#iframe-modal-content").show();
            lQuery('.cboxClose').focus();
            lQuery('#iframe-modal-content').keydown(function(event) {
                trapTabKeylolopo(lQuery(this), event);
            });
            lQuery('#iframe-modal').attr("aria-hidden","false");

            lQuery('#header .header-topbar').attr("aria-hidden","true");
            lQuery('#header .header-bottom .col-xs-4').attr("aria-hidden","true");

            lQuery('#header .header-bottom .col-xs-12 #hc-header-mobile-link').attr("aria-hidden","true");
            lQuery('#header .header-bottom .col-xs-12 #la-header-mobile-button').attr("aria-hidden","true");
            lQuery('#header .header-bottom .col-xs-12 #lolopo #lolopo-template #iframe-modal').siblings().attr("aria-hidden","true");

            lQuery('.panels').attr("aria-hidden","true");
            lQuery('.cookies-region').attr("aria-hidden","true");
            lQuery('#page').attr("aria-hidden","true");
            $(document).on("keydown", function (e) {
               if( $("#iframe-content iframe").length > 0 ) {
                   if (e.keyCode == 27) {
                       closeKeyboardIframeModal();
                   }
               }
            });
            lQuery('.cboxClose').on("keydown",function(event) {
                if (event.keyCode == 13) {
                    closeKeyboardIframeModal();
                }
            });
        });

    }

    function compareVersion(v1, v2, options) {
        var zeroExtend = options && options.zeroExtend,
            v1parts = v1 === "" ? "" : v1.split('.'),
            v2parts = v2.split('.');

        for (var i = 0; i < v1parts.length; i++) {
            v1parts[i] = parseInt(v1parts[i]);
            v2parts[i] = parseInt(v2parts[i]);
        }

        if (zeroExtend) {
            while (v1parts.length < v2parts.length) v1parts.push("0");
            while (v2parts.length < v1parts.length) v2parts.push("0");
        }

        for (i = 0; i < v1parts.length; ++i) {
            if (v2parts.length == i) {
                return 1;
            }

            if (v1parts[i] == v2parts[i]) {
                continue;
            }
            else if (v1parts[i] > v2parts[i]) {
                return 1;
            }
            else {
                return -1;
            }
        }

        if (v1parts.length != v2parts.length) {
            return -1;
        }

        return 0;
    }

    function getLibScript(source, testIsLoadedFn, callback) {
        var callbackFn = typeof callback === 'function' ? callback : function () {};

        var eventName = source + '.loaded';
        var isLoaded = false;
        if (typeof testIsLoadedFn === 'function') {
            isLoaded = testIsLoadedFn();
        }

        if (isLoaded) {
            callbackFn();
            return ;
        }
        
        /* else if (!isLoaded && isScriptIncluded(source)) {
            document.addEventListener(eventName, function () {
                callbackFn();
            });
            return ;
        }*/

        var prior = document.getElementsByTagName('script')[0];

        var script = document.createElement('script');
        script.type = "text/javascript";
        script.src = source;

        script.onload = script.onreadystatechange = function( _, isAbort ) {
            if(isAbort || (script ? (!script.readyState) : true) || /loaded|complete/.test(script.readyState) ) {
                if (script) {
                    script.onreadystatechange = null;
                }
                script = undefined;

                if(!isAbort) {
                    var event;

                    if (typeof Event === 'function') {
                        event  = new Event(eventName);
                    } else {
                        event = document.createEvent('Event');
                        event.initEvent(eventName, true, true);
                    }

                    callbackFn();
                    document.dispatchEvent(event);
                }
            }
        };

        prior.parentNode.insertBefore(script, prior);
    }

    function loadLibScript(scriptURL) {
        var script = document.createElement('script');
        script.type = "text/javascript";
        script.src = scriptURL;
        document.getElementsByTagName('head')[0].appendChild(script);
    }

    function checkJQueryVersion(callback) {
        if (typeof $ === 'undefined' ||
            $.fn === 'undefined' ||
            $.fn.jquery === 'undefined' ) {

            //Load required jQueryVersion
            getLibScript(_defaultLibURLs.jQueryURL, null, function (){
                    lQuery = jQuery.noConflict(true);
                    jQuery = oQuery;
                    $ = oQuery; 
                    callback();
                });    

        } else {
            oQuery =  $.noConflict(false);
            $ = oQuery;
            lQuery = oQuery;
            callback();            
        }
    }

    function checkMustacheVersion(callback) {
        var mustacheNeededVersion = "2.2.0";

        if (typeof Mustache === 'undefined' || compareVersion(Mustache.version, mustacheNeededVersion) === -1) {
            logger.info("Mustache lib with version '" + mustacheNeededVersion +
                "' or higher was not found in the page. It will be loaded NEO.");
            getLibScript(_defaultLibURLs.mustacheURL, null, callback);
        } else {
            callback();
        }
    }

    function checkAndLoadDependencies(callback) {
        checkJQueryVersion(function() {
            checkMustacheVersion(function() {
                callback();
            });
        });
    }

    function initLOLOPO() {
        lQuery(window).on("load",function () {
            setTimeout(function () {
                getInputElemByName(_configs.userInputNameAttribute).focus();
            }, 100);
        });

        logger.debug("On register form events");
        registerFormEvents();
        createKeyboardIframeModal();

        if (_configs.testScriptsLoading) {
            setLoadingScriptTestConfigs();
        }
    }

    function init(selector, configs) {
        window.addEventListener('error', function(event) {
            // logger.error("Error event: ", event);
            if (event.target && event.target.src) {
                logger.error("Error loading resource: ", event.target.src);
            }
        }, true);

        checkAndLoadDependencies(function() {
            initAfterCheck(selector, configs);
        });
    }

    var _loadingScriptsTestConfigs = {
        isLoadingScriptsTestEnabled: false,
        loadScriptTimeout: 2000
    };

    function setLoadingScriptTestConfigs() {
        var testConfigs = {
            LGN24Url: "http://fakelgn24.com/script.js",
            submitFormTimeout: 8000
        };

        _configs = lQuery.extend(true, {}, _configs, testConfigs);
    }


    function initAfterCheck(selector, configs) {
        configs = typeof configs !== "undefined" ? configs : {};

        _configs = lQuery.extend(true, {}, _defaultConfigs, configs);

        LOLOPOLogging.init(_configs.logging);
        LOLOPORender.init(selector, _configs.render)
            .then(function(response) {
                initLOLOPO();
            });
    }

    return {
        init: init,
        validateEnter: validateEnter,
        submitLoginForm: submitLoginForm,
        forgotPassword: forgotPassword,
        notAvailable: notAvailable
    };

})();