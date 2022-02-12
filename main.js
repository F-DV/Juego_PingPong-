(function(){                                       //Funcion anonima para programar dentro los objetos y no contaminar el scope global, MODELO
    self.Board = function(width,height){           //Creamos un objeto para el pizarron
        this.width = width;                         //Variables del objeto
        this.height = height;
        this.playing = false;
        this.game_over = false;
        this.bars = [];
        this.ball = null;

    }

    self.Board.prototype = {                        //Fuera de la declaracion de la clase , creamos esta funcion para modificar el prototipo de la misma, lo que sigue es un objeto Json
        get elements(){                             //getter para retornas las barras y la pelota
            var elements = this.bars.map(function(bar){return bar; }); //hack para que trabaje por un problema que ocurrio               
            elements.push(this.ball);                    //ponemos la pelota               
            return elements;        
        }
    }
})();

(function(){                                        //Clase para todo lo que tiene que ver con la pelota
    self.Ball = function(x,y,radius,board){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed_y = 0;
        this.speed_x = 3;
        this.board = board;
        this.direction = -1;
        this.bounce_angle = 0;
        this.max_bounce_angle = Math.PI /12;
        this.speed = 3;

        board.ball = this;
        this.kind = "circle";
       
    }
    self.Ball.prototype = {
        move: function(){
           this.x += (this.speed_x * this.direction);
           this.y += (this.speed_y); 
        },
        get width(){
            return this.radius * 2;

        },
        get height(){
            return this.radius * 2;
        },
        collision: function(bar){
        //reacciona a la colisión con una barra que recibe como párametro, clcula el angulo en el que se ,mueve la pelota y la cambia de dirección
            var relative_intersect_y = (bar.y + (bar.height / 2)) - this.y;
            
            var normalized_intersect_y = relative_intersect_y / (bar.height / 2);

            this.bounce_angle = normalized_intersect_y * this.max_bounce_angle;
            console.log(this.bounce_angle);
            this.speed_y = this.speed * -Math.sin(this.bounce_angle);
            this.speed_x = this.speed * Math.cos(this.bounce_angle);

            if(this.x > (this.board.width / 2)) this.direction = -1;
            else this.direction = 1;

        }
    }

})();

(function(){                                        //Esta funcion se autoejecuta para declarar un nuevo objeto, para las barras
    self.Bar = function(x,y,width,height,board){    //Declaramos una nueva clase que hara las barras y le pasamos,(que tamaño va a tener, en donde va a estar y donde sera dibujado)
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height; 
        this.board = board;
        this.board.bars.push(this);                  // esta linea dice: accedo al board, luego accedo a bar y le añado esta misma clase osea las barras
        this.kind = "rectangle";                    //canva necesita saber que figura va a dibuejar, guardo el tipo en una variable .kind
        this.speed = 20;                            //atributo para cambiar la velocidad 
    }

    self.Bar.prototype = {                         //Aqui adentro programamos las funciones de la clase
        down: function(){
            this.y += this.speed;
        },
        up: function(){
            this.y -= this.speed;
        },
        toString: function(){                       //el metodo toString se  ejecuta cuando se convierte este objeto a cadena
            return "x: "+ this.x + " y: "+this.y;       
        }
    }
})();

(function(){                                                             //Otra funcion anonima para hacer otra clase, esta se encargara de dibujar el tablero VISTA 

    self.BoardView = function(canvas,board){

        this.canvas = canvas;
        this.canvas.width = board.width;
        this.canvas.height = board.height;
        this.board = board;
        this.ctx = canvas.getContext("2d");
    }

    self.BoardView.prototype = {
        
        clean: function(){                                              //metodo para que limpie el board mientas movemos las barras
            this.ctx.clearRect(0,0,this.board.width,this.board.height);  
        },                                                               //Las funciones se separan por  comas 
        draw: function(){                                                 
            for(var i = this.board.elements.length -1; i>=0; i--){          //iteramos las barras
                var el = this.board.elements[i];

                draw(this.ctx,el);
            }
        },
        check_collicions : function(){
            for(var i = this.board.bars.length -1; i>=0; i--){              //iteramos las barras
                var bar = this.board.bars[i];
                if(hit(bar, this.board.ball)){
                    this.board.ball.collision(bar);
                };
                draw(this.ctx,bar);
            }
        },
        play : function(){
            if(this.board.playing){

                this.clean();                                                    //Llamamos la funcion para limpiar
                this.draw();                                                     //llammos la funcion para dibujar
                this.check_collicions();                                        //checkeamos las coliciones
                this.board.ball.move();                                         //movimiento a la pelota
            }    
            
        }
    }
    function hit(a,b){
        //revisa si a coliciona con b
        var hit = false;

        //colisiones horizontales
        if(b.x + b.width >= a.x && b.x < a.x + a.width){
            //coliciones verticales
            if(b.y + b.height >= a.y && b.y < a.y + a.height){
                hit = true;
            }
        }
        // colisión de a con b
        if(b.x <= a.x && b.x + b.width >= a.x + a.width){
            if(b.y <= a.y && b.y + b.height >= a.y + a.height){
                hit = true;
            }
        }
        //colisión de b con a
        if(a.x <= b.x && a.x + a.width >= b.x + b.width){
            if(a.y <= b.y && a.y +a.height >= b.y + b.height){
                hit = true;
            }
        }
        return hit;

    }
    function draw(ctx,element){                                           //(HELPERMETHOD)Aqui vamos a programar un tipo de metodo fuera de la clase, pero dentro de la funcion anonima que declara el objeto PARA DIBIJAR
        //if(element !== null && element.hasOwnProperty("kind")){         //element.hasOwnProperty : Nos dice si el objeto tiene una propiedad kind
            switch(element.kind){                                         //me va a dibujar dependiendo el tipo
                case "rectangle":
                    ctx.fillRect(element.x,element.y,element.width,element.height);
                    break;
                case "circle":
                    ctx.beginPath();
                    ctx.arc(element.x,element.y,element.radius,0,7);
                    ctx.fill();
                    ctx.closePath();
                    break;
            }
       // }   
    }               
})();

var board = new Board(800,400);                                 //Defino el tamaño del pizarron
var bar = new Bar(20,100,40,100,board);                         //defino el tamaño de la barra
var bar_2 = new Bar(735,100,40,100,board);                      //defino el tamaño de la otra barra
var canvas = document.getElementById("canvas");                  //llamamos el canvas del HTML por el id
var board_view = new BoardView(canvas,board);                    //defino la vista
var ball = new Ball(350, 100, 10, board);                           //definimos la pelota


window.requestAnimationFrame(controller);

document.addEventListener("keydown", function(ev){                  //Cuando el keydown suceda, se ejecuta la funcion 
    console.log(ev.keyCode);                                        //Imprime el caracter de la tecla que se presiono
                                             //para que con las flechas no se muesva la ventana

    if(ev.keyCode ==38){                                            //Si la tecla es 38 entonces llama el metoho de la clase bar : up() (BARRA 1)
        ev.preventDefault();   
        bar_2.up();
    }else if(ev.keyCode ==40){
        ev.preventDefault();   
        bar_2.down();
    }else if(ev.keyCode ==87){                                            //Si la tecla es 38 entonces llama el metoho de la clase bar : up() (BARRA 2)
        ev.preventDefault();   
        bar.up();
    }else if(ev.keyCode ==83){
        ev.preventDefault();   
        bar.down();
    }else if(ev.keyCode == 32){                                         //para pausar el juego con la barra espaciadora
        ev.preventDefault();
        board.playing = !board.playing;                                 //Asigna el contrario de lo que este pasando, si esta jugando en pausa y viceversa
    }

    console.log(""+ bar);                                           //ealizamos la concatenacion para que se ejecute el metodo toString de bar                       
});

board_view.play();

//window.requestAnimationFrame(controller);

function controller(){                                                    //clase que hara las veces de CONTROLADOR
    board_view.play();                                                      //funcion de la clase boardview que dibuja y borra
    window.requestAnimationFrame(controller);                              //actualiza
}