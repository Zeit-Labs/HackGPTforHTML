/*

Serve it locally:

    Terminal 1:
        $ python -m http.server 8080

    Terminal 2:
        $ ngrok http --domain=caiman-central-perch.ngrok-free.app 18080





Embed me into production Open edX using the following script snippet:
    <script>var NELC_API_URL = xyz</script>
    <script src="https://cdn.jsdelivr.net/gh/Zeit-Labs/HackGPTforHTML@<GIT_TAG_HERE>/html-gpt-hack.js"></script>

Embed me into development Open edX using the following script snippet:
    <script>var NELC_API_URL = xyz</script>
    <script src="https://caiman-central-perch.ngrok-free.app/html-gpt-hack.js"></script>

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

    const hasContentInMCE = () => {
        return getMCE().getContent().trim().length > 20;
    }

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
            
            IMPORTANT: All styles must be prefixed with ".nelc-studio-gpt-html-prompt-v1".
            
            If the user provides an HTML between "============ START OF USER HTML ============" and 
                "============ END OF USER HTML ==============", edit the html to match the provided prompt.
        `;

        if (hasContentInMCE()) {
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

    const getPlaceholder = () => {
        return hasContentInMCE() ?
            "عدّل على المحتوى باستخدام الذكاء الإصطناعي"
            :
            "أكتب لإنشاء محتوى بالذكاء الإصطناعي";
    }

    let inputer = () => {
        return `
            <div>
                <style>
                    .gpt-nelc-input-wrapper {
                        margin-bottom: 1.5em;
                    }
                
                    .gpt-nelc-input-wrapper .setting-input {
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

                    .gpt-nelc-input-wrapper .setting-input.gpt-loading {
                      animation: gpt-glow 1.5s ease-in-out infinite;
                      color: #868686;
                    }
                    
                    /* Animation keyframes for glowing effect */
                    @keyframes gpt-glow {
                      0% {
                        border-color: rgb(178, 178, 178, 0.5);
                      }
                      50% {
                        border-color: rgba(135,135,135,0.5);
                      }
                      0% {
                        border-color: rgb(178, 178, 178, 0.5);
                      }
                    }
                    
                    .gpt-nelc-input-wrapper .setting-send {
                        transform: scale(-1, 1);
                        position: relative;
                        top: -5px;
                        color: #0075b4;
                        right: 3px;
                        border: none;
                        background: none;
                        font-size: 1.5em;
                    }
                    
                    .gpt-nelc-input-wrapper .setting-send .fa-spinner {
                        display: none;
                    }
                    
                    .gpt-nelc-input-wrapper .setting-send.gpt-loading .fa-spinner {
                        display: inline-block;
                    }
                    
                    .gpt-nelc-input-wrapper .setting-send.gpt-loading .fa-paper-plane {
                        display: none;
                    }
                    
                </style>
                <div class="gpt-nelc-input-wrapper wrapper-comp-setting">
                    <form>
                        <input class="gpt-input input setting-input" placeholder="${getPlaceholder()}" type="text" value="">
                        <button class="gpt-input action setting-send active" type="button" data-tooltip="أرسل">
                              <span class="icon fa fa-paper-plane"></span>
                              <span class="icon fa fa-spinner fa-spin"></span>
                        </button>
                    </form>
                </div>
            </div>
            `;
    };

    setInterval(() => {
        if ($('.modal-actions').length && !$('.modal-actions .gpt-nelc-input-wrapper').length) {
            console.log('tinymce: exists ', !!$('.edit-xblock-modal').length)
            $('.modal-actions').prepend(inputer);
            console.log('tinymce: added prompt');
        }
    }, 200);

    $('body').on('submit', '.gpt-nelc-input-wrapper form', (e) => {
        e.preventDefault();
        $('.gpt-nelc-input-wrapper .gpt-input')
            .addClass('gpt-loading')
            .prop('disabled', true);

        prompter($('.gpt-nelc-input-wrapper .setting-input').val(), () => {
            $('.gpt-nelc-input-wrapper .gpt-input')
                .removeClass('gpt-loading')
                .prop('disabled', false);

            $('.gpt-nelc-input-wrapper .setting-input')
                .val('')
                .prop('placeholder', getPlaceholder());
        });
    });
}());
