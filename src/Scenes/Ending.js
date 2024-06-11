class Ending extends Phaser.Scene{
    constructor(){
        super("playerWin"); 
        this.winText; 
        this.returnText; 
    }

    preload(){

    }

    create(){
        this.nextScene = this.input.keyboard.addKey("ENTER");

        this.winText = this.add.text(200, 250, 'You saved the factory before meltdown!', {fontSize:'24px', fill: '#000' });  
        this.winText.setColor('#FFFFFF');

        this.returnText = this.add.text(150, 500, 'Press Enter for credits', {fontSize: '24px', fill: '#000'});
        this.returnText.setColor('#FFFFFF'); 
    }

    update(){
        if (Phaser.Input.Keyboard.JustDown(this.nextScene)) {
            this.scene.start("credits");
        }
    }
}