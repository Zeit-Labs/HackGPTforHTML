/*

Serve it locally:

    Terminal 1:
        $ python -m http.server 8080

    Terminal 2:
        $ ssh -R omardotesting:80:localhost:18000 serveo.net


Embed me into Open edX using the following script snippet:
    <script>var NELC_API_URL = xyz</script>
    <script src="https://omardotesting.serveo.net/html-gpt-hack.js"></script>

 */


(function () {
    console.log('tinymce: Hello it the snippet!');
    console.log('tinymce: API URL is: ', NELC_API_URL);
    const apiCall = function (system, prompt, callback) {
        console.time('tinymce: API call');
        fetch(`${NELC_API_URL}?` + new URLSearchParams({
            'system': system,
            'message': prompt,
        }))
            .then(response => response.json())
            .then(data => {
                console.info('tinymce: result', data);
                console.timeEnd('tinymce: API call');
                callback(data.result)
            })
            .catch(error => {
                console.timeEnd('tinymce: API call');
                console.error('tinymce: Error:', error)
            });
    }

    const getMCE = () => {
        return tinymce.get($('.modal-window textarea').attr('id'))
    };

    const basePrompter = window.basePrompter = function (system, prompt, callback) {
        const mce = getMCE();
        apiCall(system, prompt, (html) => {
            console.info('tinymce: apiCall called back to basePrompter');
            mce.setContent(html);
            callback ? callback('done') : null;
        });
    };

    const prompter = window.prompter = function (prompt, callback) {
        const system = `
            Act as a wysiwyg and write a piece of content to.
            Avoid returning JavaScript that facilitates XSS or any other injection or security issues.
            The output should be only HTML and CSS.
            
            Return the HTML in the following structure without head, body, html and other parent elements:
            
            <div class="nelc-studio-gpt-html-prompt-v1">
                <style>
                    STYLE GOES HERE
                </style>
                <div>
                    CONTENT GOES HERE
                </div>
            </div>
            
            Don't style the parent div.nelc-studio-gpt-html-prompt-v1, only style its content.
            
            If the user provides an HTML between "============ START OF USER HTML ============" and 
                "============ END OF USER HTML ==============", edit the html to match the provided prompt.
        `;

        if (getMCE().getContent().trim().length > 20) {
            prompt = `
                Given the HTML below:

                ============ START OF USER HTML ============
                ${getMCE().getContent()}    
                ============ END OF USER HTML ==============
                
                Here's what I want: ${prompt}
            `
        }

        basePrompter(system, prompt, callback);
    }

    let inputer = () => {
        function getRandomElement(arr) {
          const randomIndex = Math.floor(Math.random() * arr.length);
          return arr[randomIndex];
        }

        const prompts = [
            'Create a table with top 5 countries recovering from covid',
            'List in 3 bullet points the main regions of Saudi Arabia',
            'Create content on introduction of Computer Science in 4 paragraphs',
        ];

        return `
            <div>
                <style>
                    .gpt-nelc-input .setting-input {
                        border: 2px solid rgb(178, 178, 178, 0.5);
                        width: 98%;
                        margin-inline-start: -2%;
                        top: -9px;
                        position: relative;
                        height: 49px;
                        border-radius: 4px;
                        outline: none;
                        box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
                    }
                    
                    .gpt-nelc-input .setting-clear {
                        position: relative;
                        top: -6px;
                        right: 7px;
                    }
                    
                    .gpt-nelc-input .setting-input.gpt-loading {
                      animation: gpt-glow 1.5s ease-in-out infinite;
                    }
                    
                    /* Animation keyframes for glowing effect */
                    @keyframes gpt-glow {
                      0% {
                        border: 2px solid rgb(178, 178, 178, 0.5);
                      }
                      50% {
                        border: 2px solid transparent;
                      }
                      0% {
                        border: 2px solid rgb(178, 178, 178, 0.5);
                      }
                    }
                </style>
                <div class="gpt-nelc-input wrapper-comp-setting">
                    <form>
                        <input class="input setting-input" placeholder="Example: ${getRandomElement(prompts)}" type="text" value="">
                        <button class="action setting-clear active" type="button" name="setting-clear" value="حذف" data-tooltip="حذف">
                              <span class="icon fa fa-undo" aria-hidden="true"></span><span class="sr">"مسح القيمة"</span>
                        </button>
                    </form>
                </div>
            </div>
            `;
    };

    setInterval(() => {
        if ($('.modal-actions').length && !$('.modal-actions .gpt-nelc-input').length) {
            console.log('tinymce: exists ', !!$('.edit-xblock-modal').length)
            $('.modal-actions').prepend(inputer);
            console.log('tinymce: added prompt');
        }
    }, 200);

    $('body').on('click', '.gpt-nelc-input .setting-clear', () => {
        $('.gpt-nelc-input .setting-input').val('');
        return false;
    });
    
    $('body').on('submit', '.gpt-nelc-input form', (e) => {
        e.preventDefault();
        $('.gpt-nelc-input .setting-input')
            .addClass('gpt-loading')
            .prop('disabled', true);

        prompter($('.gpt-nelc-input .setting-input').val(), () => {
            $('.gpt-nelc-input .setting-input')
                .removeClass('gpt-loading')
                .prop('disabled', false)
                .val('');
        });
    });
}());
