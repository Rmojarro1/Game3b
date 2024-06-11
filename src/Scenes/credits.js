class Credits extends Phaser.Scene{
    constructor(){
        super("credits"); 
        this.winText; 
        this.returnText; 
    }

    preload(){

    }

    create(){
        this.nextScene = this.input.keyboard.addKey("ENTER");

        this.winText = this.add.text(200, 250, 'Developed by Raul Mojarro', {fontSize:'24px', fill: '#000' });  
        this.winText.setColor('#FFFFFF');

        this.returnText = this.add.text(150, 500, 'Press Enter to return to title screen', {fontSize: '24px', fill: '#000'});
        this.returnText.setColor('#FFFFFF'); 
    }

    update(){
        if (Phaser.Input.Keyboard.JustDown(this.nextScene)) {
            this.scene.start("titleScreen");
        }
    }
}