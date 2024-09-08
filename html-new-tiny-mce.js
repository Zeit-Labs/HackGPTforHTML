/*

Serve it locally:

    Terminal 1:
        $ python -m http.server 8080

    Terminal 2:
        $ ngrok http --domain=caiman-central-perch.ngrok-free.app 18080





Embed me into production Open edX using the following script snippet:
    <script>
        tinyMCE.remove('textarea');
        window.tinyMCE = window.tinymce = null;
    </script>
    <script src="TINY_MCE_EMBED_URL" referrerpolicy="origin"></script>
    <script src="https://cdn.jsdelivr.net/gh/Zeit-Labs/HackGPTforHTML@v5/html-new-tiny-mce.js"></script>

Embed me into development Open edX using the following script snippet:
    <script src="TINY_MCE_EMBED_URL" referrerpolicy="origin"></script>
    <script src="https://caiman-central-perch.ngrok-free.app/html-new-tiny-mce.js"></script>

 */


(function () {
    console.log('tinymce: Upgrading!');

    const getTextarea = () => {
        const textarea = $('.modal-window textarea');
        return textarea;
    }

    const getMCE = () => {
        return tinymce.get(getTextarea().attr('id'));
    };

    const hasContentInMCE = () => {
        const contentLength = getMCE()?.getContent()?.trim()?.length;
        return contentLength && (contentLength > 20);
    }

    setInterval(() => {
        if ($('.modal-actions').length && !$('textarea#mce_0').prop('has-mce7')) {
            $('textarea#mce_0').prop('has-mce7', true);
            console.log('tinymce: exists ', !!$('textarea#mce_0').prop('has-mce7'))
            tinyMCE.remove('textarea');
            tinymce.init({
                selector: 'textarea#mce_0',
                plugins: [
                    // Core editing features
                    'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
                ],
                toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                tinycomments_mode: 'embedded',
                tinycomments_author: 'Author name',
                mergetags_list: [
                    {value: 'First.Name', title: 'First Name'},
                    {value: 'Email', title: 'Email'},
                ],
                ai_request: (request, respondWith) => respondWith.string(() => Promise.reject('See docs to implement AI Assistant')),
            });

            console.log('tinymce: added prompt');
        }
    }, 200);


}());
