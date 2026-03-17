document.addEventListener('DOMContentLoaded', function() {

    window.stepValue = function(inputId, step) {
        const input = document.getElementById(inputId);
        let newValue = parseFloat(input.value) + step;
        
        newValue = Math.max(parseFloat(input.min), Math.min(parseFloat(input.max), newValue));
        
        input.value = newValue;
        
        if (inputId === 'fontSize') {
            document.getElementById('fontSizeValue').textContent = newValue + 'px';
        } else if (inputId === 'lineHeight') {
            document.getElementById('lineHeightValue').textContent = newValue;
        } else if (inputId === 'coverPositionY') {
            document.getElementById('coverPositionYValue').textContent = newValue + '%';
        } else if (inputId === 'coverPositionX') {
            document.getElementById('coverPositionXValue').textContent = newValue + '%';
        }
        
        input.dispatchEvent(new Event('input'));
    };

    const titleInput = document.getElementById('titleInput');
    const contentInput = document.getElementById('contentInput');
    const authorInput = document.getElementById('authorInput');
    const coverImageInput = document.getElementById('coverImage');
    const contentAlign = document.getElementById('contentAlign');
    const fontSizeInput = document.getElementById('fontSize');
    const lineHeightInput = document.getElementById('lineHeight');
    const fontSizeValue = document.getElementById('fontSizeValue');
    const lineHeightValue = document.getElementById('lineHeightValue');
    const exportBtn = document.getElementById('exportBtn');
    const coverPositionYInput = document.getElementById('coverPositionY');
    const coverPositionYValue = document.getElementById('coverPositionYValue');
    const coverPositionXInput = document.getElementById('coverPositionX');
    const coverPositionXValue = document.getElementById('coverPositionXValue');
    const coverSizeSelect = document.getElementById('coverSize');

    const posterCover = document.getElementById('posterCover');
    const previewTitle = document.getElementById('titleText');
    const previewContent = document.getElementById('previewContent');
    const previewAuthor = document.getElementById('previewAuthor');
    const previewMagazineTitle = document.getElementById('previewMagazineTitle');

    titleInput.addEventListener('input', updatePreview);
    contentInput.addEventListener('input', updatePreview);
    authorInput.addEventListener('input', updatePreview);

    contentAlign.addEventListener('change', updatePreview);
    fontSizeInput.addEventListener('input', function() {
        fontSizeValue.textContent = this.value + 'px';
        updatePreview();
    });
    lineHeightInput.addEventListener('input', function() {
        lineHeightValue.textContent = this.value;
        updatePreview();
    });

    coverImageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                posterCover.style.backgroundImage = `url(${e.target.result})`;
                posterCover.classList.add('has-image');
            };
            reader.readAsDataURL(file);
        } else {
            posterCover.style.backgroundImage = '';
            posterCover.classList.remove('has-image');
        }
    });

    coverPositionYInput.addEventListener('input', function() {
        coverPositionYValue.textContent = this.value + '%';
        posterCover.style.backgroundPosition = coverPositionXInput.value + '% ' + this.value + '%';
    });

    coverPositionXInput.addEventListener('input', function() {
        coverPositionXValue.textContent = this.value + '%';
        posterCover.style.backgroundPosition = this.value + '% ' + coverPositionYInput.value + '%';
    });

    coverSizeSelect.addEventListener('change', function() {
        posterCover.style.backgroundSize = this.value;
    });

    function updatePreview() {
        previewMagazineTitle.textContent = 'مجلة المنتدى الثقافي';
        previewTitle.textContent = titleInput.value || 'العنوان الرئيسي';

        const content = contentInput.value || 'النص الرئيسي هنا...';
        previewContent.textContent = content;
        
        const align = contentAlign.value;
        previewContent.classList.remove('center-align', 'right-align');
        previewContent.classList.add(align === 'center' ? 'center-align' : 'right-align');
        
        const fontSize = fontSizeInput.value;
        const lineHeight = lineHeightInput.value;
        previewContent.style.fontSize = fontSize + 'px';
        previewContent.style.lineHeight = lineHeight;
        
        previewAuthor.textContent = authorInput.value || 'الاسم';
        
        handleTextOverflow();
    }

    function handleTextOverflow() {
        const textElement = previewContent;
        const container = textElement.parentElement;
        
        textElement.classList.remove('truncated');
        textElement.style.maxHeight = 'none';
        
        if (textElement.scrollHeight > container.clientHeight - 20) {
            const lineHeight = parseFloat(lineHeightInput.value) * parseInt(fontSizeInput.value);
            const maxLines = Math.floor(container.clientHeight / lineHeight);
            const maxHeight = lineHeight * maxLines;
            textElement.style.maxHeight = maxHeight + 'px';
            textElement.classList.add('truncated');
        }
    }

    exportBtn.addEventListener('click', async function() {
        const poster = document.getElementById('posterPreview');
        
        exportBtn.textContent = 'جاري التصدير...';
        exportBtn.disabled = true;

        try {
            const originalStyles = {
                transform: poster.style.transform,
                width: poster.style.width,
                height: poster.style.height,
                overflow: poster.style.overflow
            };
            
            const outerFrame = poster.querySelector('.outer-frame');
            const originalFrameStyles = {
                transform: outerFrame.style.transform,
                width: outerFrame.style.width,
                height: outerFrame.style.height
            };
            
            poster.style.transform = 'none';
            poster.style.width = '600px';
            poster.style.height = '800px';
            poster.style.overflow = 'hidden';
            
            outerFrame.style.transform = 'none';
            outerFrame.style.width = 'auto';
            outerFrame.style.height = 'auto';
            
            await new Promise(resolve => setTimeout(resolve, 150));
            
            const canvas = await html2canvas(poster, {
                width: 600,
                height: 800,
                scale: 3,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#BFA98A',
                logging: false,
                windowWidth: 600,
                windowHeight: 800
            });
            
            poster.style.transform = originalStyles.transform;
            poster.style.width = originalStyles.width;
            poster.style.height = originalStyles.height;
            poster.style.overflow = originalStyles.overflow;
            
            outerFrame.style.transform = originalFrameStyles.transform;
            outerFrame.style.width = originalFrameStyles.width;
            outerFrame.style.height = originalFrameStyles.height;

            const link = document.createElement('a');
            link.download = 'poster-' + Date.now() + '.png';
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();

        } catch (error) {
            console.error('Export error:', error);
            alert('حدث خطأ أثناء التصدير. يرجى المحاولة مرة أخرى.');
        }

        exportBtn.textContent = 'تصدير الملصق';
        exportBtn.disabled = false;
    });

    window.addEventListener('resize', function() {
        handleTextOverflow();
    });

    posterCover.style.backgroundPosition = coverPositionXInput.value + '% ' + coverPositionYInput.value + '%';
    posterCover.style.backgroundSize = coverSizeSelect.value;

    updatePreview();
});
