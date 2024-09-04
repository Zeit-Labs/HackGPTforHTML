(function () {
    const apiCall = function(prompt, callback) {
        setTimeout(() => {
            callback(
                `
                Note: This was generated using the <code>${prompt}</code> prompt.
                <div>
                  <style scoped>
                    table {
                      width: 100%;
                      border-collapse: collapse;
                    }
                    th, td {
                      padding: 10px;
                      text-align: left;
                      border-bottom: 1px solid #ddd;
                    }
                    th {
                      background-color: #f2f2f2;
                      font-weight: bold;
                    }
                    tr:hover {
                      background-color: #f5f5f5;
                    }
                    .recovery-rate {
                      font-weight: bold;
                      color: #2d862d;
                    }
                  </style>
                
                  <h2>Top 3 Countries Recovering from COVID-19</h2>
                  <table>
                    <tr>
                      <th>Rank</th>
                      <th>Country</th>
                      <th>Total Recoveries</th>
                      <th>Recovery Rate</th>
                    </tr>
                    <tr>
                      <td>1</td>
                      <td>Country A</td>
                      <td>1,000,000</td>
                      <td class="recovery-rate">95%</td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td>Country B</td>
                      <td>800,000</td>
                      <td class="recovery-rate">92%</td>
                    </tr>
                    <tr>
                      <td>3</td>
                      <td>Country C</td>
                      <td>750,000</td>
                      <td class="recovery-rate">90%</td>
                    </tr>
                  </table>
                </div>
                `
            )
        }, 500)
    }

    const promptTemplate = function(prompt) {
        return `
            Act as a wysiwyg and write a piece of content to ${prompt}. 
            Use scoped styling.
        `;
    }

    const getMCE = () => {
        return tinymce.get($('.modal-window textarea').attr('id'))
    };


    const basePrompter = window.basePrompter = function(prompt, callback) {
        const mce = getMCE();
        apiCall(prompt, (html) => {
            mce.setContent(html);
            callback('done');
        });
    };

    const prompter = window.prompter = function(prompt) {
        basePrompter(promptTemplate(prompt));
    }

    let inputer = `
        <div class="wrapper-comp-setting">
          <input class="input setting-input" type="text" id="prompt-html" value="">
          <button class="action setting-clear active" type="button" name="setting-clear" value="حذف" data-tooltip="حذف">
                <span class="icon fa fa-undo" aria-hidden="true"></span><span class="sr">"مسح القيمة"</span>
          </button>
        </div>
    `;
}());
