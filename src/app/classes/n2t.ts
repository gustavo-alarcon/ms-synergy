export class N2t {
  flag;
  importe_parcial;
  num = "";
  num_letra = "";
  num_letras = "";
  num_letram = "";
  num_letradm = "";
  num_letracm = "";
  num_letramm = "";
  num_letradmm = "";

  constructor() {
    this.flag = 0;
  }

  unidad(numero: number) {
    numero = Math.floor(numero);
    switch (numero) {
      case 9:
        this.num = "nueve";
        break;
      case 8:
        this.num = "ocho";
        break;
      case 7:
        this.num = "siete";
        break;
      case 6:
        this.num = "seis";
        break;
      case 5:
        this.num = "cinco";
        break;
      case 4:
        this.num = "cuatro";
        break;
      case 3:
        this.num = "tres";
        break;
      case 2:
        this.num = "dos";
        break;
      case 1:
        if (this.flag == 0) this.num = "uno";
        else this.num = "un";
        break;
      case 0:
        this.num = "";
        break;
    }
    return this.num;
  }

  decena(numero: number) {
    numero = Math.floor(numero);
    if (numero >= 90 && numero <= 99) {
      this.num_letra = "noventa ";
      if (numero > 90)
        this.num_letra = this.num_letra
          .concat("y ")
          .concat(this.unidad(numero - 90));
    } else if (numero >= 80 && numero <= 89) {
      this.num_letra = "ochenta ";
      if (numero > 80)
        this.num_letra = this.num_letra
          .concat("y ")
          .concat(this.unidad(numero - 80));
    } else if (numero >= 70 && numero <= 79) {
      this.num_letra = "setenta ";
      if (numero > 70)
        this.num_letra = this.num_letra
          .concat("y ")
          .concat(this.unidad(numero - 70));
    } else if (numero >= 60 && numero <= 69) {
      this.num_letra = "sesenta ";
      if (numero > 60)
        this.num_letra = this.num_letra
          .concat("y ")
          .concat(this.unidad(numero - 60));
    } else if (numero >= 50 && numero <= 59) {
      this.num_letra = "cincuenta ";
      if (numero > 50)
        this.num_letra = this.num_letra
          .concat("y ")
          .concat(this.unidad(numero - 50));
    } else if (numero >= 40 && numero <= 49) {
      this.num_letra = "cuarenta ";
      if (numero > 40)
        this.num_letra = this.num_letra
          .concat("y ")
          .concat(this.unidad(numero - 40));
    } else if (numero >= 30 && numero <= 39) {
      this.num_letra = "treinta ";
      if (numero > 30)
        this.num_letra = this.num_letra
          .concat("y ")
          .concat(this.unidad(numero - 30));
    } else if (numero >= 20 && numero <= 29) {
      if (numero == 20) this.num_letra = "veinte ";
      else this.num_letra = "veinti".concat(this.unidad(numero - 20));
    } else if (numero >= 10 && numero <= 19) {
      switch (numero) {
        case 10:
          this.num_letra = "diez ";
          break;

        case 11:
          this.num_letra = "once ";
          break;

        case 12:
          this.num_letra = "doce ";
          break;

        case 13:
          this.num_letra = "trece ";
          break;

        case 14:
          this.num_letra = "catorce ";
          break;

        case 15:
          this.num_letra = "quince ";
          break;

        case 16:
          this.num_letra = "dieciseis ";
          break;

        case 17:
          this.num_letra = "diecisiete ";
          break;

        case 18:
          this.num_letra = "dieciocho ";
          break;

        case 19:
          this.num_letra = "diecinueve ";
          break;
      }
    } else this.num_letra = this.unidad(numero);

    return this.num_letra;
  }

  centena(numero: number) {
    numero = Math.floor(numero);
    if (numero >= 100) {
      if (numero >= 900 && numero <= 999) {
        this.num_letra = "novecientos ";
        if (numero > 900)
          this.num_letra = this.num_letra.concat(this.decena(numero - 900));
      } else if (numero >= 800 && numero <= 899) {
        this.num_letra = "ochocientos ";
        if (numero > 800)
          this.num_letra = this.num_letra.concat(this.decena(numero - 800));
      } else if (numero >= 700 && numero <= 799) {
        this.num_letra = "setecientos ";
        if (numero > 700)
          this.num_letra = this.num_letra.concat(this.decena(numero - 700));
      } else if (numero >= 600 && numero <= 699) {
        this.num_letra = "seiscientos ";
        if (numero > 600)
          this.num_letra = this.num_letra.concat(this.decena(numero - 600));
      } else if (numero >= 500 && numero <= 599) {
        this.num_letra = "quinientos ";
        if (numero > 500)
          this.num_letra = this.num_letra.concat(this.decena(numero - 500));
      } else if (numero >= 400 && numero <= 499) {
        this.num_letra = "cuatrocientos ";
        if (numero > 400)
          this.num_letra = this.num_letra.concat(this.decena(numero - 400));
      } else if (numero >= 300 && numero <= 399) {
        this.num_letra = "trescientos ";
        if (numero > 300)
          this.num_letra = this.num_letra.concat(this.decena(numero - 300));
      } else if (numero >= 200 && numero <= 299) {
        this.num_letra = "doscientos ";
        if (numero > 200)
          this.num_letra = this.num_letra.concat(this.decena(numero - 200));
      } else if (numero >= 100 && numero <= 199) {
        if (numero == 100) this.num_letra = "cien ";
        else this.num_letra = "ciento ".concat(this.decena(numero - 100));
      }
    } else this.num_letra = this.decena(numero);

    return this.num_letra;
  }

  miles(numero: number) {
    numero = Math.floor(numero);
    if (numero >= 1000 && numero < 2000) {
      this.num_letram = "mil ".concat(this.centena(numero % 1000));
    }
    if (numero >= 2000 && numero < 10000) {
      this.flag = 1;
      this.num_letram = this.unidad(numero / 1000)
        .concat(" mil ")
        .concat(this.centena(numero % 1000));
    }
    if (numero < 1000) this.num_letram = this.centena(numero);

    return this.num_letram;
  }

  decmiles(numero: number) {
    numero = Math.floor(numero);
    if (numero == 10000) this.num_letradm = "diez mil";
    if (numero > 10000 && numero < 20000) {
      this.flag = 1;
      this.num_letradm = this.decena(numero / 1000)
        .concat("mil ")
        .concat(this.centena(numero % 1000));
    }
    if (numero >= 20000 && numero < 100000) {
      this.flag = 1;
      this.num_letradm = this.decena(numero / 1000)
        .concat(" mil ")
        .concat(this.miles(numero % 1000));
    }

    if (numero < 10000) this.num_letradm = this.miles(numero);

    return this.num_letradm;
  }

  cienmiles(numero: number) {
    numero = Math.floor(numero);
    if (numero == 100000) this.num_letracm = "cien mil";
    if (numero >= 100000 && numero < 1000000) {
      this.flag = 1;
      this.num_letracm = this.centena(numero / 1000)
        .concat(" mil ")
        .concat(this.centena(numero % 1000));
    }
    if (numero < 100000) this.num_letracm = this.decmiles(numero);
    return this.num_letracm;
  }

  millon(numero: number) {
    numero = Math.floor(numero);
    if (numero >= 1000000 && numero < 2000000) {
      this.flag = 1;
      this.num_letramm = "Un millon ".concat(this.cienmiles(numero % 1000000));
    }
    if (numero >= 2000000 && numero < 10000000) {
      this.flag = 1;
      this.num_letramm = this.unidad(numero / 1000000)
        .concat(" millones ")
        .concat(this.cienmiles(numero % 1000000));
    }
    if (numero < 1000000) this.num_letramm = this.cienmiles(numero);

    return this.num_letramm;
  }

  decmillon(numero: number) {
    numero = Math.floor(numero);
    if (numero == 10000000) this.num_letradmm = "diez millones";
    if (numero > 10000000 && numero < 20000000) {
      this.flag = 1;
      this.num_letradmm = this.decena(numero / 1000000)
        .concat("millones ")
        .concat(this.cienmiles(numero % 1000000));
    }
    if (numero >= 20000000 && numero < 100000000) {
      this.flag = 1;
      this.num_letradmm = this.decena(numero / 1000000)
        .concat(" milllones ")
        .concat(this.millon(numero % 1000000));
    }

    if (numero < 10000000) this.num_letradmm = this.millon(numero);

    return this.num_letradmm;
  }

  convertirLetras(numero: number) {
    this.num_letras = this.decmillon(numero);
    return this.num_letras;
  }
}
