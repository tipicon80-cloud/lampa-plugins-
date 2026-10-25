(function () {
    'use strict';

    var CinemaByWolf = {
        name: 'cinemabywolf',
        version: '3.0.0-movies',
        debug: false,
        settings: {
            show_ru: true,
            show_en: true,
            show_ua: true,
            sort_mode: 'popularity.desc'
        }
    };

    // Русские сервисы
    var RU_CINEMAS = [
        { name: 'Start', networkId: '2493' },
        { name: 'Premier', networkId: '2859' },
        { name: 'KION', networkId: '4085' },
        { name: 'Okko', networkId: '3871' },
        { name: 'КиноПоиск', networkId: '3827' },
        { name: 'Wink', networkId: '5806' },
        { name: 'ИВИ', networkId: '3923' },
        { name: 'Смотрим', networkId: '5000' },
        { name: 'Первый', networkId: '558' },
        { name: 'СТС', networkId: '806' },
        { name: 'ТНТ', networkId: '1191' },
        { name: 'Пятница', networkId: '3031' },
        { name: 'Россия 1', networkId: '412' },
        { name: 'НТВ', networkId: '1199' }
    ];

    // Иностранные сервисы
    var EN_CINEMAS = [
        { name: 'Netflix', networkId: '213' },
        { name: 'Apple TV', networkId: '2552' },
        { name: 'HBO', networkId: '49' },
        { name: 'Hulu', networkId: '453' },
        { name: 'Amazon Prime', networkId: '1024' },
        { name: 'Disney+', networkId: '2739' },
        { name: 'Paramount+', networkId: '4330' }
    ];

    // Украинские сервисы
    var UA_CINEMAS = [
        { name: '1+1', networkId: '1254' },
        { name: 'ICTV', networkId: '1166' },
        { name: 'СТБ', networkId: '1206' }
    ];

    var SORT_MODES = {
        'popularity.desc': 'Популярные',
        'primary_release_date.desc': 'По дате (новые)',
        'primary_release_date.asc': 'По дате (старые)',
        'vote_average.desc': 'По рейтингу',
        'vote_count.desc': 'По количеству голосов'
    };

    var STORAGE_KEY = 'cinemabywolf_settings_movies';

    // ====================== НАСТРОЙКИ ======================

    function loadSettings() {
        var saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                var obj = JSON.parse(saved);
                for (var k in obj) {
                    CinemaByWolf.settings[k] = obj[k];
                }
            } catch (e) {}
        }

        // Инициализация списков кинотеатров
        if (!CinemaByWolf.settings.ru_cinemas) {
            CinemaByWolf.settings.ru_cinemas = {};
            RU_CINEMAS.forEach(function (c) {
                CinemaByWolf.settings.ru_cinemas[c.networkId] = true;
            });
        }
        if (!CinemaByWolf.settings.en_cinemas) {
            CinemaByWolf.settings.en_cinemas = {};
            EN_CINEMAS.forEach(function (c) {
                CinemaByWolf.settings.en_cinemas[c.networkId] = true;
            });
        }
        if (!CinemaByWolf.settings.ua_cinemas) {
            CinemaByWolf.settings.ua_cinemas = {};
            UA_CINEMAS.forEach(function (c) {
                CinemaByWolf.settings.ua_cinemas[c.networkId] = true;
            });
        }
    }

    function saveSettings() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(CinemaByWolf.settings));
    }

    // ====================== МЕНЮ ======================

    function addMenuButtons() {
        var $menu = $('.menu .menu__list').eq(0);
        if (!$menu.length) return;

        // Удаляем старые кнопки
        $('.cinemabywolf-btn-ru, .cinemabywolf-btn-en, .cinemabywolf-btn-ua').remove();

        function createButton(type, text) {
            var ico = '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 48 48"><text x="50%" y="55%" text-anchor="middle" font-family="Arial" font-size="32" font-weight="700" fill="currentColor" dominant-baseline="middle">' + type.toUpperCase() + '</text></svg>';

            var $btn = $(`
                <li class="menu__item selector cinemabywolf-btn-${type}">
                    <div class="menu__ico">${ico}</div>
                    <div class="menu__text">${text}</div>
                </li>
            `);

            $btn.on('hover:enter', function () {
                openCinemasModal(type);
            });

            $menu.append($btn);
        }

        if (CinemaByWolf.settings.show_ru) createButton('ru', 'Кинотеатры');
        if (CinemaByWolf.settings.show_en) createButton('en', 'Кинотеатры');
        if (CinemaByWolf.settings.show_ua) createButton('ua', 'Кинотеатры');
    }

    function refreshMenuButtons() {
        addMenuButtons();
    }

    // ====================== КАТАЛОГ ФИЛЬМОВ ======================

    function openCinemaCatalog(networkId, name) {
        var sort = CinemaByWolf.settings.sort_mode || 'popularity.desc';

        Lampa.Activity.push({
            url: 'discover/movie',
            title: name + ' (фильмы)',
            networks: networkId,          // TMDB всё равно понимает
            sort_by: sort,
            component: 'category_full',
            source: 'tmdb',
            card_type: true,
            page: 1
        });
    }

    // ====================== МОДАЛЬНОЕ ОКНО ======================

    function openCinemasModal(type) {
        var list = type === 'ru' ? RU_CINEMAS : type === 'en' ? EN_CINEMAS : UA_CINEMAS;
        var enabled = type === 'ru' ? CinemaByWolf.settings.ru_cinemas :
                      type === 'en' ? CinemaByWolf.settings.en_cinemas :
                                     CinemaByWolf.settings.ua_cinemas;

        var filtered = list.filter(function (c) {
            return enabled[c.networkId] !== false;
        });

        var titleText = type === 'ru' ? 'Русские кинотеатры (фильмы)' :
                        type === 'en' ? 'Иностранные кинотеатры (фильмы)' :
                                       'Украинские кинотеатры (фильмы)';

        var $container = $('<div class="cinemabywolf-cards"></div>');

        filtered.forEach(function (c) {
            var $card = $(`
                <div class="cinemabywolf-card selector">
                    <div class="cinemabywolf-card__logo">${c.name.charAt(0)}</div>
                    <div class="cinemabywolf-card__name">${c.name}</div>
                </div>
            `);

            $card.on('hover:enter', function () {
                Lampa.Modal.close();
                openCinemaCatalog(c.networkId, c.name);
            });

            $container.append($card);
        });

        Lampa.Modal.open({
            title: titleText,
            html: $container,
            size: 'medium',
            onBack: function () {
                Lampa.Modal.close();
                Lampa.Controller.toggle('menu');
            }
        });
    }

    // ====================== СТИЛИ ======================

    function addStyles() {
        if ($('#cinemabywolf-styles').length) return;

        var css = `
            .cinemabywolf-cards {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 16px;
                padding: 20px;
            }
            .cinemabywolf-card {
                width: 120px;
                height: 120px;
                background: rgba(30,30,40,0.95);
                border-radius: 16px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                transition: 0.2s;
            }
            .cinemabywolf-card.focus, .cinemabywolf-card:hover {
                background: linear-gradient(135deg, #e94057, #f27121);
                transform: scale(1.05);
            }
            .cinemabywolf-card__logo {
                width: 60px;
                height: 60px;
                background: #fff;
                color: #222;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 26px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .cinemabywolf-card__name {
                color: #fff;
                font-size: 14px;
                text-align: center;
            }
        `;

        $('head').append('<style id="cinemabywolf-styles">' + css + '</style>');
    }

    // ====================== НАСТРОЙКИ В МЕНЮ ======================

    function addSettings() {
        Lampa.SettingsApi.addComponent({
            component: 'cinemabywolf',
            name: 'Онлайн кинотеатры (Фильмы)',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/><polygon points="10,9 16,12 10,15" fill="currentColor"/></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'cinemabywolf',
            param: { name: 'show_ru', type: 'trigger', default: true },
            field: { name: 'Показывать RU Кинотеатры' },
            onChange: function (val) {
                CinemaByWolf.settings.show_ru = val;
                saveSettings();
                refreshMenuButtons();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'cinemabywolf',
            param: { name: 'show_en', type: 'trigger', default: true },
            field: { name: 'Показывать EN Кинотеатры' },
            onChange: function (val) {
                CinemaByWolf.settings.show_en = val;
                saveSettings();
                refreshMenuButtons();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'cinemabywolf',
            param: { name: 'show_ua', type: 'trigger', default: true },
            field: { name: 'Показывать UA Кинотеатры' },
            onChange: function (val) {
                CinemaByWolf.settings.show_ua = val;
                saveSettings();
                refreshMenuButtons();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'cinemabywolf',
            param: {
                name: 'sort_mode',
                type: 'select',
                values: SORT_MODES,
                default: 'popularity.desc'
            },
            field: { name: 'Сортировка фильмов' },
            onChange: function (val) {
                CinemaByWolf.settings.sort_mode = val;
                saveSettings();
            }
        });
    }

    // ====================== ЗАПУСК ======================

    function startPlugin() {
        loadSettings();
        addStyles();
        addSettings();

        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                setTimeout(refreshMenuButtons, 800);
            }
        });

        Lampa.Listener.follow('menu', function (e) {
            if (e.type === 'open') {
                refreshMenuButtons();
            }
        });
    }

    startPlugin();

    window.cinemabywolf = CinemaByWolf;

})();
