/*

Serve it locally:

    Terminal 1:
        $ python -m http.server 8080

    Terminal 2:
        $ ngrok http --domain=caiman-central-perch.ngrok-free.app 18080


Embed me into production Open edX using the following script snippet:
    <script>var NELC_API_URL = xyz</script>
    <script src="https://cdn.jsdelivr.net/gh/Zeit-Labs/HackGPTforHTML@v5/html-gpt-hack.js"></script>

Embed me into development Open edX using the following script snippet:
    <script>var NELC_API_URL = xyz</script>
    <script src="https://caiman-central-perch.ngrok-free.app/html-gpt-hack.js"></script>

 */

;(function () {
  console.log('tinymce: Hello it the snippet!')
  console.log('tinymce: API URL is: ', NELC_API_URL)
  const apiCall = function (system, prompt, callback) {
    console.time('tinymce: API call')
    fetch(
      `${NELC_API_URL}?` +
        new URLSearchParams({
          system: system,
          message: prompt,
        })
    )
      .then((response) => response.json())
      .then((data) => {
        console.info('tinymce: result', data)
        console.timeEnd('tinymce: API call')
        callback(data.result)
      })
      .catch((error) => {
        console.timeEnd('tinymce: API call')
        console.error('tinymce: Error:', error)
      })
  }

  const getTextarea = () => {
    const textarea = $('.modal-window textarea')
    return textarea
  }

  function makeRandomId(length) {
    const characters =
      'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
      .map((byte) => characters[byte % characters.length])
      .join('')
  }

  const getMCE = () => {
    return tinymce.get(getTextarea().attr('id'))
  }

  const hasContentInMCE = () => {
    const contentLength = getMCE()?.getContent()?.trim()?.length
    return contentLength && contentLength > 20
  }

  const basePrompter = (window.basePrompter = function (
    system,
    prompt,
    callback
  ) {
    const mce = getMCE()
    apiCall(system, prompt, (html) => {
      console.info('tinymce: apiCall called back to basePrompter')
      mce.setContent(html)
      callback ? callback('done') : null
    })
  })

  const prompter = (window.prompter = function (prompt, callback) {
    const parentClass = `n-gpt-${makeRandomId(9)}`

    const system = `
            You are a TinyMCE (WYSIWYG Editor), HTML, CSS and JS master. and ready to help with writing some row html to be inserted to a TinyMCE.
            You will also take security seriously and will never return any snippets that facilitates XSS or any other injection or security issues under any circumstances.
            Retun only HTML, CSS, and Javascript without any additional texts before or after, as this will be inserted automatically to the editor.

            Return the HTML in the following structure without head, body, html and other parent elements:
            """
            <!-- in comments explain what the html is doing in natural language in details -->
            <style> {{ STYLE GOES HERE }} </style>
            <div class="${parentClass}"> {{ CONTENT GOES HERE }} </div>
            <script> {{ JAVASCRIPT GOES HERE }} </script>
            """
            IMPORTANT: All CSS rules should be scoped in ".${parentClass}" CSS class.

            Always respond in the same language as the prompt unless directed otherwise in the prompt.

            If the user provides an HTML between "============ START OF USER HTML ============"  and "============ END OF USER HTML ==============", edit the html to match the provided prompt keep the original language unless directed otherwise and update the comment to include the last changes too.
        `

    if (hasContentInMCE()) {
      prompt = `
                Given the HTML below:

                ============ START OF USER HTML ============
                ${getMCE().getContent()}
                ============ END OF USER HTML ==============

                Here's what I want: ${prompt}
            `
    }

    basePrompter(system, prompt, callback)
  })

  const getPlaceholder = () => {
    return hasContentInMCE()
      ? 'عدّل على المحتوى باستخدام الذكاء الإصطناعي'
      : 'أكتب لإنشاء محتوى بالذكاء الإصطناعي'
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
            `
  }

  setInterval(() => {
    if (
      $('.modal-actions').length &&
      !$('.modal-actions .gpt-nelc-input-wrapper').length
    ) {
      console.log('tinymce: exists ', !!$('.edit-xblock-modal').length)
      $('.modal-actions').prepend(inputer)
      console.log('tinymce: added prompt')
    }
  }, 200)

  const submit = () => {
    $('.gpt-nelc-input-wrapper .gpt-input')
      .addClass('gpt-loading')
      .prop('disabled', true)

    prompter($('.gpt-nelc-input-wrapper .setting-input').val(), () => {
      $('.gpt-nelc-input-wrapper .gpt-input')
        .removeClass('gpt-loading')
        .prop('disabled', false)

      $('.gpt-nelc-input-wrapper .setting-input')
        .val('')
        .prop('placeholder', getPlaceholder())
    })
  }

  $('body').on('click', '.gpt-nelc-input-wrapper button', (e) => {
    e.preventDefault()
    submit()
  })

  $('body').on('submit', '.gpt-nelc-input-wrapper form', (e) => {
    e.preventDefault()
    submit()
  })
})()
