// Object of plugins to add to Globals.PLUGINS
Globals.PLUGINS.themePluginCubePortfolio = function(context) {
  // ----------------------------------------------------------------
  // Plugin: Cube Portfolio
  // @see: http://hilios.github.io/jQuery.countdown/
  // ----------------------------------------------------------------
  var $cubePortfolios = context.find('[data-toggle="cbp"]');
  if ($cubePortfolios.length > 0) {
    var themePluginCubePortfolioInit = function() {
      $cubePortfolios.each(function() {
        var $this = $(this),
          customSettings = $this.data('settings') || {},
          defaultSettings = {
            layoutMode: 'mosaic',
            sortToPreventGaps: true,
            defaultFilter: '*',
            animationType: 'slideDelay',
            gapHorizontal: 2,
            gapVertical: 2,
            gridAdjustment: 'responsive',
            mediaQueries: [{
              width: 1100,
              cols: 4
            }, {
              width: 800,
              cols: 3
            }, {
              width: 480,
              cols: 2
            }, {
              width: 0,
              cols: 1
            }],
            caption: 'zoom',
            displayTypeSpeed: 100,

            // lightbox
            lightboxDelegate: '.cbp-lightbox',
            lightboxGallery: true,
            lightboxTitleSrc: 'data-title',
            lightboxCounter: '<div class="cbp-popup-lightbox-counter">{{current}} of {{total}}</div>',

            // singlePageInline
            singlePageInlinePosition: 'top',
            singlePageInlineInFocus: true,

            // singlePage
            singlePageAnimation: 'fade'

          },
          settings = $.extend({}, defaultSettings, customSettings);

        // Custom callbacks
        settings.singlePageInlineCallback = function(url, element) {
          var t = this,
            $this = $(t),
            $element = $(element),
            content = $element.data('content') || 'ajax',
            customNavButtons = function($html, t) {
              var customClose = $html.find('[data-cbp-close]') || null;
              if (customClose !== null) {
                $(t.wrap).addClass('has-custom-close');
                $(t.closeButton).hide();
                customClose.on('click', function() {
                  t.close();
                });
              }
            };

          // get content from ajax or inline HTML
          if (content !== 'ajax' && $(content).length > 0) {
            // Inline HTML
            var html = $(content).clone(true, true);
            html.themeRefresh();
            t.content.html('');
            t.content.append(html.contents());
            t.cubeportfolio.$obj.trigger('updateSinglePageInlineStart.cbp');
            t.singlePageInlineIsOpen.call(t);
          } else if (content == 'ajax') {
            // Ajax
            $.ajax({
                url: url,
                type: 'GET',
                dataType: 'html',
                timeout: 30000
              })
              .done(function(result) {
                // overwritter updateSinglePageInline() so events work
                var html = $(result);
                html.themeRefresh();
                customNavButtons(html, t);
                t.content.html('');
                t.content.append(html);
                t.cubeportfolio.$obj.trigger('updateSinglePageInlineStart.cbp');
                t.singlePageInlineIsOpen.call(t);

                if ($document.imagesLoaded) {
                  t.content.imagesLoaded(function() {
                    // If inline has owlCarousel
                    var $owl = t.content.find('[data-toggle="owl-carousel"]');
                    $owl.on('translated.owl.carousel', function(event) {
                      setTimeout(function() {
                        t.resizeSinglePageInline();
                      }, 200);
                    });

                    setTimeout(function() {
                      t.resizeSinglePageInline();
                    }, 1000);
                  });
                }
              })
              .fail(function() {
                t.updateSinglePageInline('AJAX Error! Please refresh the page!');
              });
          } else {
            t.updateSinglePageInline('Content Error! Please refresh the page!');
          }
        };
        settings.singlePageCallback = function(url, element) {
          var t = this;

          // Ajax
          $.ajax({
              url: url,
              type: 'GET',
              dataType: 'html',
              timeout: 30000
            })
            .done(function(result) {
              // overwrite updateSinglePageInline() so events work
              var html = $(result);
              html.themeRefresh();
              var counterMarkup,
                animationFinish,
                scripts, isWrap;

              t.content.addClass('cbp-popup-content').removeClass('cbp-popup-content-basic');
              if (isWrap === false) {
                t.content.removeClass('cbp-popup-content').addClass('cbp-popup-content-basic');
              }
              // update counter navigation
              if (t.counter) {
                counterMarkup = $(t.getCounterMarkup(t.options.singlePageCounter, t.current + 1, t.counterTotal));
                t.counter.text(counterMarkup.text());
              }
              t.fromAJAX = {
                html: html,
                scripts: scripts
              };
              t.finishOpen--;
              if (t.finishOpen <= 0) {
                t.wrap.addClass('cbp-popup-ready');
                t.wrap.removeClass('cbp-popup-loading');
                t.content.html('');
                t.content.append(html);
                t.checkForSocialLinks(t.content);
                t.cubeportfolio.$obj.trigger('updateSinglePageComplete.cbp');
              }
            })
            .fail(function() {
              t.updateSinglePage('AJAX Error! Please refresh the page!');
            });
        };

        // If imagesLoaded avaliable use it
        if ($document.imagesLoaded) {
          $this.imagesLoaded(function() {
            $this.cubeportfolio(settings);
          });
        }
      });
    };
    $document.themeLoadPlugin(
      ["https://unpkg.com/imagesloaded@4/imagesloaded.pkgd.min.js", "cubeportfolio-jquery-plugin/cubeportfolio/js/jquery.cubeportfolio.js"], ["plugin-css/plugin-magnific-popup.min.css", "plugin-css/plugin-cube-portfolio.min.css", "cubeportfolio-jquery-plugin/cubeportfolio/css/cubeportfolio.css"],
      themePluginCubePortfolioInit
    );
  }
};


