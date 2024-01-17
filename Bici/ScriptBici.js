let stampabici = "";

stampabici = `<img class="immagini_stagione" src="Le nostre Bici/Intestazione/madonnina_Bici.jpg" />`
document.getElementById("StampaBici").innerHTML = stampabici;

function CalcolaMTB() {

    stampabici = `
    <img class="immagini_stagione" src="Le nostre Bici/Intestazione/Sonic/SonicMTB.jpg" />
    <br />
    <div class="contorno">
        <img class="immagine_bicisx" src="Le nostre Bici/MTB/La Pantera Nera .jpg">
        <h1 class="Titolo2">La Pantera Nera</h1>
        <p><strong>Tipo Freni:</strong> Pattino</p>
        <p><strong>Materiale:</strong> Acciaio</p>
        <p><strong>Misura Ruote:</strong> 27</p>
        <p><strong>cambi:</strong> 3 avanti 7 dietro<br>Totale 21</p>
        <p><strong>anno di produzione:</strong> 2016</p>
    </div>
    
    <div class="contorno">
        <img class="immagine_bicidx" src="Le nostre Bici/MTB/La Fluo.jpg">
        <h1 class="Titolo2">La Fluo</h1>
        <p><strong>Tipo Freni:</strong> Disco</p>
        <p><strong>Materiale:</strong> Acciaio</p>
        <p><strong>Misura Ruote:</strong> 29</p>
        <p><strong>cambi:</strong> 3 avanti 7 dietro<br>Totale 21</p>
        <p><strong>anno di produzione:</strong> 2020</p>
    </div>
    
    <div class="contorno">
        <img class="immagine_bicisx" src="Le nostre Bici/MTB/La Bianconera .jpg">
        <h1 class="Titolo2">La Bianconera</h1>
        <p><strong>Tipo Freni:</strong> Disco</p>
        <p><strong>Materiale:</strong> Acciaio</p>
        <p><strong>Misura Ruote:</strong> 29</p>
        <p><strong>cambi:</strong> 3 avanti 7 dietro<br>Totale 21</p>
        <p><strong>anno di produzione:</strong> 2020</p>
    </div>
    
    <div class="contorno">
        <img class="immagine_bicidx" src="Le nostre Bici/MTB/La Pimpa.jpg">
        <h1 class="Titolo2">La Pimpa</h1>
        <p><strong>Tipo Freni:</strong> Disco</p>
        <p><strong>Materiale:</strong> Acciaio</p>
        <p><strong>Misura Ruote:</strong> 29</p>
        <p><strong>cambi:</strong> 3 avanti 8 dietro<br>Totale 24</p>
        <p><strong>anno di produzione:</strong> 2021</p>
    </div>
    
    <div class="contorno">
        <img class="immagine_bicisx" src="Le nostre Bici/MTB/La Splendente.jpg">
        <h1 class="Titolo2">La Splendente</h1>
        <p><strong>Tipo Freni:</strong> Disco</p>
        <p><strong>Materiale:</strong> Acciaio</p>
        <p><strong>Misura Ruote:</strong> 27</p>
        <p><strong>cambi:</strong> 3 avanti 7 dietro<br>Totale 21</p>
        <p><strong>anno di produzione:</strong> 2022</p>
    </div>
`;

    document.getElementById("StampaBici").innerHTML = stampabici;
}


function  CalcolaCorsa()
{

    stampabici = `
    <img class="immagini_stagione" src="Le nostre Bici/Intestazione/Sonic/SonicCorsa.jpg" />
    <br />
    <div class="contorno">
        <img class="immagine_bicisx" src="Le nostre Bici/Corsa/La Corsara .jpg">
        <h1 class="Titolo2"> La Corsara</h1>
        <p><strong>Tipo Freni : </strong> Pattino</p>
        <p><strong>Materiale :</strong> Fibra di Carbonio</p>
        <p><strong>Misura Ruote : </strong> 28</p>
        <p>
            <strong> cambi : </strong>2 avanti 11 dietro
            <br> Totale 22
        </p>
        <p> <strong> anno di produzione : </strong>2022</p>
    </div>
    `;

    document.getElementById("StampaBici").innerHTML = stampabici;
}