class Title extends Phaser.Scene{
    constructor(){
        super("titleScreen"); 
        this.titleText; 
    }

    preload(){

    }

    create(){
        this.nextScene = this.input.keyboard.addKey("ENTER");

        this.titleText = this.add.text(200, 300, 'Reactor Havoc!', {fontSize:'30px', fill: '#000' });  
        this.titleText.setColor('#FFFFFF');

        document.getElementById('description').innerHTML = '<h2>Game2b</h2><br>W: up // S: down // Space: fire/emit'
    }

    update(){
        if (Phaser.Input.Keyboard.JustDown(this.nextScene)) {
            this.scene.start("platformerScene");
        }
    }
}