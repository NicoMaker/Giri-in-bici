let stampabici = "";

function CalcolaMTB() {
    stampabici = `
    <div class="contorno">
        <img class="immagine_bicisx" src="Le nostre Bici/La Pantera Nera .jpg">
        <h1 class="Titolo2">La Pantera Nera</h1>
        <p><b>Tipo Freni:</b> Pattino</p>
        <p><b>Materiale:</b> Acciaio</p>
        <p><b>Misura Ruote:</b> 27</p>
        <p><b>cambi:</b> 3 avanti 7 dietro<br>Totale 21</p>
        <p><b>anno di produzione:</b> 2016</p>
    </div>

    <div class="contorno">
        <img class="immagine_bicidx" src="Le nostre Bici/La Fluo.jpg">
        <h1 class="Titolo2">La Fluo</h1>
        <p><b>Tipo Freni:</b> Disco</p>
        <p><b>Materiale:</b> Acciaio</p>
        <p><b>Misura Ruote:</b> 29</p>
        <p><b>cambi:</b> 3 avanti 7 dietro<br>Totale 21</p>
        <p><b>anno di produzione:</b> 2020</p>
    </div>

    <div class="contorno">
        <img class="immagine_bicisx" src="Le nostre Bici/La Bianconera .jpg">
        <h1 class="Titolo2">La Bianconera</h1>
        <p><b>Tipo Freni:</b> Disco</p>
        <p><b>Materiale:</b> Acciaio</p>
        <p><b>Misura Ruote:</b> 29</p>
        <p><b>cambi:</b> 3 avanti 7 dietro<br>Totale 21</p>
        <p><b>anno di produzione:</b> 2020</p>
    </div>

    <div class="contorno">
        <img class="immagine_bicidx" src="Le nostre Bici/La Pimpa.jpg">
        <h1 class="Titolo2">La Pimpa</h1>
        <p><b>Tipo Freni:</b> Disco</p>
        <p><b>Materiale:</b> Acciaio</p>
        <p><b>Misura Ruote:</b> 29</p>
        <p><b>cambi:</b> 3 avanti 8 dietro<br>Totale 24</p>
        <p><b>anno di produzione:</b> 2021</p>
    </div>

    <div class="contorno">
        <img class="immagine_bicisx" src="Le nostre Bici/La Splendente.jpg">
        <h1 class="Titolo2">La Splendente</h1>
        <p><b>Tipo Freni:</b> Disco</p>
        <p><b>Materiale:</b> Acciaio</p>
        <p><b>Misura Ruote:</b> 27</p>
        <p><b>cambi:</b> 3 avanti 7 dietro<br>Totale 21</p>
        <p><b>anno di produzione:</b> 2022</p>
    </div>
`;

    document.getElementById("StampaBici").innerHTML = stampabici;
}


function  CalcolaCorsa()
{
    stampabici = `
    <div class="contorno">
        <img class="immagine_bicisx" src="Le nostre Bici/La Corsara .jpg">
        <h1 class="Titolo2"> La Corsara</h1>
        <p><b>Tipo Freni : </b> Pattino</p>
        <p><b>Materiale :</b> Fibra di Carbonio</p>
        <p><b>Misura Ruote : </b> 28</p>
        <p>
            <b> cambi : </b>2 avanti 11 dietro
            <br> Totale 22
        </p>
        <p> <b> anno di produzione : </b>2022</p>
    </div>
    `;

    document.getElementById("StampaBici").innerHTML = stampabici;
}