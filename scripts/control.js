/* Script com a lógica de controle da landing page */

// Espera o DOM estar completamente carregado antes de executar o script:
document.addEventListener('DOMContentLoaded', () => {
    // Seleciona TODOS os wrappers de carrossel da página:
    const allCarouselWrappers = document.querySelectorAll('.carousel-wrapper');

    for (const wrapper of allCarouselWrappers) {
        
        // Encontra os elementos específicos dentro do wrapper atual:
        const container = wrapper.querySelector('.carousel-container');
        const slide = wrapper.querySelector('.carousel-slide');
        const items = wrapper.querySelectorAll('.carousel-item');
        const prevBtn = wrapper.querySelector('.carousel-prev');
        const nextBtn = wrapper.querySelector('.carousel-next');
        const indicatorsContainer = wrapper.querySelector('.carousel-indicators');

        const totalItems = items.length;
        if (totalItems === 0) continue; 

        let currentIndex = 0;
        let itemsPerView = 3; // Valor padrão
        
        let isDragging = false;
        let startX = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;

        
        function updateItemsPerView() {
            const fixedItemsPerView = parseInt(wrapper.dataset.itemsPerView, 10);

            if (!isNaN(fixedItemsPerView) && fixedItemsPerView > 0) {
                itemsPerView = fixedItemsPerView;
            } else {
                const width = window.innerWidth;
                if (width < 769) { // <-- ATUALIZADO para corresponder ao CSS
                    itemsPerView = 1;
                } else if (width < 1081) { // <-- ATUALIZADO para corresponder ao CSS
                    itemsPerView = 2;
                } else {
                    itemsPerView = 3;
                }
            }
        }


        // Função para criar os indicadores (bolinhas)
        function createIndicators() {
            if (!indicatorsContainer) return;
            indicatorsContainer.innerHTML = ''; 
            const numPages = Math.ceil(totalItems / itemsPerView);
            for (let i = 0; i < numPages; i++) {
                const indicator = document.createElement('div');
                indicator.classList.add('carousel-indicator');
                indicator.addEventListener('click', () => moveToIndex(i * itemsPerView));
                indicatorsContainer.appendChild(indicator);
            }
        }

        // Função para atualizar qual indicador está ativo
        function updateIndicators() {
            if (!indicatorsContainer) return;
            const indicators = indicatorsContainer.querySelectorAll('.carousel-indicator');
            const currentPage = Math.floor(currentIndex / itemsPerView);
            indicators.forEach((indicator, idx) => {
                indicator.classList.toggle('carousel-indicator-active', idx === currentPage);
            });
        }

        // Função para mover o carrossel para um índice específico
        function moveToIndex(index) {
            // Garante que o índice não saia dos limites
            currentIndex = Math.max(0, Math.min(index, totalItems - itemsPerView));
            
            const itemWidth = items[0].offsetWidth;
            const gap = parseFloat(getComputedStyle(slide).gap) || 0;
            const offset = -currentIndex * (itemWidth + gap);
            
            slide.style.transform = `translateX(${offset}px)`;
            prevTranslate = offset; 

            updateIndicators();
        }

        // --- EVENT LISTENERS ---

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentIndex == 0) {
                    moveToIndex(itemsPerView * Math.ceil(totalItems / itemsPerView) - itemsPerView);
                } else moveToIndex(currentIndex - itemsPerView);
            });

            nextBtn.addEventListener('click', () => {
                if (currentIndex == itemsPerView * Math.ceil(totalItems / itemsPerView) - itemsPerView) {
                    moveToIndex(0);
                } else moveToIndex(currentIndex + itemsPerView);
            });
        }

        // LÓGICA DE ARRASTAR (MOUSE E TOUCH)
        slide.addEventListener('mousedown', dragStart);
        slide.addEventListener('touchstart', dragStart, { passive: true });

        slide.addEventListener('mouseup', dragEnd);
        slide.addEventListener('mouseleave', dragEnd);
        slide.addEventListener('touchend', dragEnd);

        slide.addEventListener('mousemove', drag);
        slide.addEventListener('touchmove', drag, { passive: true });

        function dragStart(event) {
            isDragging = true;
            startX = event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
            slide.style.transition = 'none'; 
            slide.style.cursor = 'grabbing';
        }

        function drag(event) {
            if (!isDragging) return;
            const currentPosition = event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
            currentTranslate = prevTranslate + currentPosition - startX;
            slide.style.transform = `translateX(${currentTranslate}px)`;
        }

        function dragEnd(event) {
            if (!isDragging) return;
            isDragging = false;
            slide.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
            slide.style.cursor = 'grab';

            const movedBy = currentTranslate - prevTranslate;
            const threshold = 100; // Aumenta o threshold para evitar mudanças acidentais

            if (movedBy < -threshold) {
                moveToIndex(currentIndex + itemsPerView);
            } else if (movedBy > threshold) {
                moveToIndex(currentIndex - itemsPerView);
            } else {
                moveToIndex(currentIndex); 
            }
        }

        // Previne o comportamento padrão de arrastar imagem no navegador
        slide.addEventListener('dragstart', (e) => e.preventDefault());

        // Configuração inicial e reajuste no redimensionamento da janela
        function setupCarousel() {
            updateItemsPerView();
            createIndicators();
            moveToIndex(0); // Sempre começa do primeiro item
        }

        window.addEventListener('resize', setupCarousel);
        setupCarousel(); 

        // --- LÓGICA PARA PREVENIR CLIQUE ACIDENTAL AO ARRASTAR ---
        const clickableLinks = wrapper.querySelectorAll('a');
        clickableLinks.forEach(link => {
            let isClickValid = false;

            link.addEventListener('click', (e) => {
                if (!isClickValid) {
                    e.preventDefault();
                }
            });

            link.addEventListener('mousedown', () => {
                isClickValid = true;
            });

            link.addEventListener('mousemove', () => {
                isClickValid = false;
            });

            // Adiciona o listener de duplo clique para abrir o link
            link.addEventListener('dblclick', (e) => {
                e.preventDefault(); 
                const url = link.href;
                if (url) {
                    window.open(url, link.target || '_blank');
                }
            });
        });
    }

    // --- LÓGICA DOS IMOVÉIS CLICAVEIS ---
    const cards = document.querySelectorAll(".cartao-imovel");
    const link = "https://www.google.com/maps/place/Instituto+de+Ci%C3%AAncias+Exatas+e+Aplicadas+-+ICEA%2FUFOP/@-19.8361918,-43.1702806,17z/data=!3m1!4b1!4m6!3m5!1s0xa507511efdbbd3:0x55a7ef3c198b9753!8m2!3d-19.8361918!4d-43.1677057!16s%2Fg%2F1tf172_b?entry=ttu&g_ep=EgoyMDI1MDcwOC4wIKXMDSoASAFQAw%3D%3D";

    cards.forEach(card => {
        card.style.cursor = "pointer";
        card.addEventListener("click", function () {
            window.open(link, "_blank");
        });
    });

    // --- LÓGICA DO FORMULÁRIO DE CONTATO  ---
    emailjs.init('nRFCdVlUADZocJb5U');

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); 
            
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Enviando...';
            submitButton.disabled = true;

            emailjs.sendForm('service_fu1jrxm', 'template_vn7yr0l', this).then(() => {
                alert('Mensagem enviada com sucesso!');
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
                contactForm.reset(); 
            }, (error) => {
                alert('Ocorreu um erro ao enviar a mensagem. Tente novamente.');
                console.log('FAILED...', error);
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            });
        });
    }

    // --- LÓGICA PARA PREVENIR O MENU DE CONTEXTO ---
    document.addEventListener('contextmenu', (event) => {
            event.preventDefault();
    });

});