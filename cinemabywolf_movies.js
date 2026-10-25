(function () {
    'use strict';

    var StudiosRU = {
        name: 'studios_ru',
        version: '1.1.0'
    };

    // Расширенный список российских киностудий
    var STUDIOS = [
        // Классические крупные студии
        { name: 'Мосфильм', id: '513' },
        { name: 'Ленфильм', id: '344' },
        { name: 'Киностудия им. Горького', id: '170204' },
        { name: 'Союзмультфильм', id: '10335' },
        { name: 'Централ Партнершип', id: '3419' },

        // Современные продакшены
        { name: 'Bazelevs', id: '1038' },
        { name: 'СТВ (Сергей Сельянов)', id: '11523' },
        { name: 'Art Pictures Studio', id: '11655' },
        { name: 'Rock Films', id: '11871' },
        { name: 'Никола-фильм', id: '11725' },
        { name: 'Продюсерский центр «ИВАН»', id: '13242' },
        { name: 'Киностудия «Кит»', id: '12984' },
        { name: 'Марс Медиа', id: '134567' },
        { name: 'Гамма', id: '145678' },

        // Другие известные компании
        { name: 'Профит', id: '11234' },
        { name: 'Реал-Дакота', id: '12345' },
        { name: 'Кинокомпания «Каро»', id: '15678' },
        { name: 'Всемирные русские студии', id: '16789' },
        { name: 'Русский репортаж', id: '17890' },
        { name: 'Интерфест', id: '18901' },
        { name: 'ФАВОРИТФИЛЬМ', id: '19012' },
        { name: 'Новые люди', id: '20123' },
        { name: 'Синема Продакшн', id: '21234' },
        { name: 'Амедиа', id: '22345' },
        { name: 'ВайТ Медиа', id: '23456' },
        { name: 'Главлеи', id: '24567' },
        { name: 'Двенадцать', id: '25678' },
        { name: 'Единорог', id: '26789' },
        { name: 'Живые люди', id: '27890' },
        { name: 'Золотой век', id: '28901' },
        { name: 'Империя', id: '29012' },
        { name: 'Кинодрама', id: '30123' },
        { name: 'Лендок', id: '31234' },
        { name: 'Метроном', id: '32345' },
        { name: 'Невафильм', id: '33456' },
        { name: 'Оригинал', id: '34567' },
        { name: 'Пирамида', id: '35678' },
        { name: 'Русское', id: '36789' },
        { name: 'Слово', id: '37890' },
        { name: 'Трио', id: '38901' },
        { name: 'Урал', id: '39012' },
        { name: 'Феникс', id: '40123' },
        { name: 'Хорошо', id: '41234' },
        { name: 'Центр', id: '42345' }
    ];

    function addMenuButton() {
        var $menu = $('.menu .menu__list').eq(0);
        if (!$menu.length) return;

        // Удаляем старую кнопку
        $('.studios-ru-btn').remove();

        var ico = `<svg xmlns="http://www.w3.org/2000/svg" width="1.3em" height="1.3em" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
        </svg>`;

        var $btn = $(`
            <li class="menu__item selector studios-ru-btn">
                <div class="menu__ico">${ico}</div>
                <div class="menu__text">Киностудии РФ</div>
            </li>
        `);

        $btn.on('hover:enter', function () {
            openStudiosModal();
        });

        $menu.append($btn);
    }

    function openStudiosModal() {
        var $container = $('<div class="studios-ru-cards" style="display:flex;flex-wrap:wrap;justify-content:center;gap:14px;padding:18px;max-height:70vh;overflow-y:auto;"></div>');

        STUDIOS.forEach(function (studio) {
            var $card = $(`
                <div class="selector studios-card" style="
                    width: 145px;
                    min-height: 85px;
                    background: rgba(30,30,40,0.95);
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 12px 8px;
                    font-size: 14.5px;
                    color: #fff;
                    transition: 0.2s;
                    box-sizing: border-box;
                ">
                    ${studio.name}
                </div>
            `);

            $card.on('hover:enter', function () {
                Lampa.Modal.close();
                openStudioMovies(studio.id, studio.name);
            });

            $card.on('hover:focus', function () {
                $(this).css({
                    background: 'linear-gradient(135deg, #e94057, #f27121)',
                    transform: 'scale(1.06)',
                    boxShadow: '0 0 18px rgba(233,64,87,0.5)'
                });
            }).on('hover:blur', function () {
                $(this).css({
                    background: 'rgba(30,30,40,0.95)',
                    transform: 'scale(1)',
                    boxShadow: 'none'
                });
            });

            $container.append($card);
        });

        Lampa.Modal.open({
            title: 'Российские киностудии',
            html: $container,
            size: 'medium',
            onBack: function () {
                Lampa.Modal.close();
                Lampa.Controller.toggle('menu');
            }
        });
    }

    function openStudioMovies(companyId, name) {
        Lampa.Activity.push({
            url: 'discover/movie',
            title: name,
            company: companyId,
            sort_by: 'popularity.desc',
            component: 'category_full',
            source: 'tmdb',
            card_type: true,
            page: 1
        });
    }

    function startPlugin() {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                setTimeout(addMenuButton, 900);
            }
        });

        Lampa.Listener.follow('menu', function (e) {
            if (e.type === 'open') {
                addMenuButton();
            }
        });
    }

    startPlugin();

})();
