class Swiper {
    constructor (sliderClass, sliderTrackClass, arrowNextClass,
    arrowPrevClass, sliderPaginationClass) {
            this.slider = document.querySelector(`.${sliderClass}`);
            this.sliderTrack = this.slider.querySelector(`.${sliderTrackClass}`);
            
            this.lengthSwipe = 100;

            this.controlDirection = new ControlDirection(this.sliderTrack);

            this.pagination = new Pagination(this.controlDirection, this.slider);
            this.pagination.createPaginationBullet(`${sliderPaginationClass}`);

            this.clickEvent = new ClickEvent(this.controlDirection, this.pagination, this.slider, 
                arrowNextClass, arrowPrevClass);
            this.visualTransform = new VisualTransform(this.controlDirection, this.sliderTrack);
            this.clickMoveEvent = new ClickMoveEvent(this.controlDirection, this.visualTransform, 
                this.pagination, this.sliderTrack, this.lengthSwipe);
            
            window.addEventListener('resize', this.onResizeScreen.bind(this));
        
            this.swipingInterval = setInterval(function() {
                this.controlDirection.swipingNext();
                this.pagination.selectingActiveBullet();
            }.bind(this), 3000);

            this.slider.addEventListener('mouseover', function() {
                clearInterval(this.swipingInterval);
            }.bind(this));
            this.slider.addEventListener('touchstart', function() {
                clearInterval(this.swipingInterval);
            }.bind(this));
            
    };  

    onResizeScreen() {
        this.width = this.sliderTrack.offsetWidth;
        this.sliderTrack.style.transition = "transform 0ms ease-in-out";
        this.sliderTrack.style.transform = "translateX(" + -this.controlDirection.parametres.currentSlide * this.width + "px)"
    };
};

class ControlDirection {
    constructor (sliderTrack) {
        this.sliderTrack = sliderTrack;
        this.parametres = {
            slidesCount : this.sliderTrack.children.length,
            currentSlide : 0
        };
    };
    swipingNext () {
        if (this.parametres.currentSlide < this.parametres.slidesCount - 1) {
            this.parametres.currentSlide += 1;
            this.sliderTrack.style.transform = "translateX(" + -this.parametres.currentSlide * this.sliderTrack.offsetWidth + "px)";
            this.sliderTrack.style.transition = "transform 200ms ease-in-out";
        };
    };
    swipingPrev () {
        if (this.parametres.currentSlide >= 1) {
            this.parametres.currentSlide -= 1;
            this.sliderTrack.style.transform = "translateX(" + -this.parametres.currentSlide * this.sliderTrack.offsetWidth + "px)";
            this.sliderTrack.style.transition = "transform 200ms ease-in-out";
        };
    };
};

class ClickEvent {
    constructor(controlDirection, pagination, slider, arrowNextClass,
        arrowPrevClass) {
        this.arrowNext = slider.querySelector(`.${arrowNextClass}`);
        this.arrowPrev = slider.querySelector(`.${arrowPrevClass}`);
        this.pagination = pagination;

        this.arrowNext.addEventListener('click', () => {
            controlDirection.swipingNext();
            this.pagination.selectingActiveBullet();
        });
        this.arrowPrev.addEventListener('click', () => {
            controlDirection.swipingPrev();
            this.pagination.selectingActiveBullet();
        });
    };
};

class ClickMoveEvent {
    constructor (controlDirection, visualTransform, pagination, sliderTrack, lengthSwipe) {
        this.startCoordX = 0;
        this.currentCoordX = 0;
        this.shift = 0;
        this.lengthSwipe = lengthSwipe;

        this.sliderTrack = sliderTrack;

        this.pagination = pagination;
        this.visualTransform = visualTransform;
        this.controlDirection = controlDirection;

        this.onMouseMoveThis = this.onMouseMove.bind(this);
        this.onMouseUpThis = this.onMouseUp.bind(this);
        this.sliderTrack.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.sliderTrack.addEventListener('touchstart', this.onMouseDown.bind(this));
    };
    onMouseDown (evt) {
        if (evt.type === "mousedown") {
            this.startCoordX = evt.pageX;
        } else {
            this.startCoordX = evt.touches[0].pageX;
        };
        this.sliderTrack.style.transition = "transform 0ms ease-in-out";

        document.addEventListener('mousemove', this.onMouseMoveThis);
        document.addEventListener('touchmove', this.onMouseMoveThis);
        document.addEventListener('mouseup', this.onMouseUpThis);
        document.addEventListener('touchend', this.onMouseUpThis);
    };

    onMouseMove (moveEvt) {
        if (moveEvt.type === "mousemove") {
            this.currentCoordX = moveEvt.pageX;
        } else {
            this.currentCoordX = moveEvt.touches[0].pageX;
        };
        
        this.shift = this.startCoordX - this.currentCoordX;
        this.visualTransform.transformSlide(this.shift, this.controlDirection.parametres.currentSlide)
    };

    onMouseUp () {
        const curSlide = this.controlDirection.parametres.currentSlide;

        if (this.shift > this.lengthSwipe && curSlide < this.controlDirection.parametres.slidesCount - 1) {
            this.controlDirection.swipingNext();
        } else if (this.shift < -this.lengthSwipe && -this.lengthSwipe && curSlide >= 1) {
            this.controlDirection.swipingPrev();
        } else {            
            this.sliderTrack.style.transform = "translateX(" + (-curSlide * this.sliderTrack.offsetWidth) + "px)";
            this.sliderTrack.style.transition = "transform 200ms ease-in-out";
        };
        this.pagination.selectingActiveBullet();
        document.removeEventListener('mousemove', this.onMouseMoveThis);
        document.removeEventListener('touchmove', this.onMouseMoveThis);
        document.removeEventListener('mouseup', this.onMouseUpThis);
        document.removeEventListener('touchend', this.onMouseUpThis);
    };
};

class VisualTransform {
    constructor (controlDirection, sliderTrack) {
        this.sliderTrack = sliderTrack;
        this.controlDirection = controlDirection;
    };
    transformSlide(shift) {
        const width = this.sliderTrack.offsetWidth;
        const curSlide = this.controlDirection.parametres.currentSlide;
        if (shift > width) {
            shift = width;
        } else if (shift < -width) {
            shift = -width;
        };
        this.sliderTrack.style.transform = "translateX(" + (-curSlide * width - shift) + "px)";
    };
};


class Pagination {
    constructor(controlDirection, slider) {
        this.controlDirection = controlDirection;
        this.paginationBullets = slider.querySelector(`.slider-pagination`);
    };
    createPaginationBullet(paginationBulletsClass) {
        for (let i = 0; i < this.controlDirection.parametres.slidesCount; i++) {
            if (i === 0) {
                this.paginationBullets.innerHTML +=`<span class="${paginationBulletsClass}__bullet bullet--active"></span>`
            } else {
                this.paginationBullets.innerHTML +=`<span class="${paginationBulletsClass}__bullet"></span>`
            };
        };
    };

    selectingActiveBullet () {
        for (let i = 0; i < this.paginationBullets.children.length; i ++) {
            this.paginationBullets.children[i].classList.remove("bullet--active");
        };
        this.paginationBullets.children[this.controlDirection.parametres.currentSlide].classList.add("bullet--active");
    };
};

new Swiper('slider', 'slider-track', 'arrow--next',
'arrow--prev', 'slider-pagination');
