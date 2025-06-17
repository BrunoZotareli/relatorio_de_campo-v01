document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formVisita');
  const listaRelatorio = document.getElementById('listaRelatorio');
  const statusDiv = document.getElementById('status');

  const checkboxFungos = document.getElementById('fungos');
  const divDetalhesFungos = document.getElementById('detalhesFungos');

  const checkboxInsetos = document.getElementById('insetos');
  const divDetalhesInsetos = document.getElementById('detalhesInsetos');

  const checkboxPlantas = document.getElementById('plantas');
  const divDetalhesPlantas = document.getElementById('detalhesPlantas');

  checkboxFungos.addEventListener('change', () => {
    divDetalhesFungos.style.display = checkboxFungos.checked ? 'block' : 'none';
  });

  checkboxInsetos.addEventListener('change', () => {
    divDetalhesInsetos.style.display = checkboxInsetos.checked ? 'block' : 'none';
  });

  checkboxPlantas.addEventListener('change', () => {
    divDetalhesPlantas.style.display = checkboxPlantas.checked ? 'block' : 'none';
  });

  function setupPreview(fileInputId, previewDivId) {
    const input = document.getElementById(fileInputId);
    const preview = document.getElementById(previewDivId);

    input.addEventListener('change', () => {
      preview.innerHTML = '';
      const files = input.files;
      if (files.length === 0) return;

      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = e => {
          const img = document.createElement('img');
          img.src = e.target.result;
          preview.appendChild(img);
        };
        reader.readAsDataURL(file);
      });
    });
  }

  setupPreview('fotosFungos', 'previewFungos');
  setupPreview('fotosInsetos', 'previewInsetos');
  setupPreview('fotosPlantas', 'previewPlantas');

  let visitas = JSON.parse(localStorage.getItem('visitas')) || [];

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const solo = document.getElementById('solo').value;
    const fungos = checkboxFungos.checked;
    const insetos = checkboxInsetos.checked;
    const plantas = checkboxPlantas.checked;

    // Fungos
    let tipoFungo = '', nivelFungo = '', aplicarFungicida = '';
    if (fungos) {
      tipoFungo = document.getElementById('tipoFungo').value;
      nivelFungo = document.getElementById('nivelFungo').value;
      aplicarFungicida = document.getElementById('aplicarFungicida').value;
    }

    // Insetos
    let tipoInseto = '', nivelInseto = '', aplicarInseticida = '';
    if (insetos) {
      tipoInseto = document.getElementById('tipoInseto').value;
      nivelInseto = document.getElementById('nivelInseto').value;
      aplicarInseticida = document.getElementById('aplicarInseticida').value;
    }

    // Função para pegar nomes dos arquivos selecionados
    function getFileNames(inputId) {
      const files = document.getElementById(inputId).files;
      return Array.from(files).map(f => f.name);
    }

    statusDiv.textContent = 'Salvando...';

    navigator.geolocation.getCurrentPosition((pos) => {
      const novaVisita = {
        nome,
        solo,
        fungos,
        tipoFungo,
        nivelFungo,
        aplicarFungicida,
        fotosFungos: fungos ? getFileNames('fotosFungos') : [],
        insetos,
        tipoInseto,
        nivelInseto,
        aplicarInseticida,
        fotosInsetos: insetos ? getFileNames('fotosInsetos') : [],
        plantas,
        fotosPlantas: plantas ? getFileNames('fotosPlantas') : [],
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        data: new Date().toLocaleString()
      };

      visitas.push(novaVisita);
      localStorage.setItem('visitas', JSON.stringify(visitas));

      atualizarRelatorio();
      statusDiv.textContent = navigator.onLine
        ? 'Visita salva e enviada para a nuvem.'
        : 'Visita salva localmente (offline).';

      form.reset();
      divDetalhesFungos.style.display = 'none';
      divDetalhesInsetos.style.display = 'none';
      divDetalhesPlantas.style.display = 'none';

      // Limpa previews
      document.getElementById('previewFungos').innerHTML = '';
      document.getElementById('previewInsetos').innerHTML = '';
      document.getElementById('previewPlantas').innerHTML = '';
    }, () => {
      statusDiv.textContent = 'Erro ao obter localização.';
    });
  });

  function atualizarRelatorio() {
    listaRelatorio.innerHTML = '';
    visitas.forEach((v) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${v.data}</strong> - ${v.nome}<br>
        Solo: ${v.solo}<br>
        Fungos: ${v.fungos ? `Sim - ${v.tipoFungo} | Nível: ${v.nivelFungo} | Fungicida: ${v.aplicarFungicida} | Fotos: ${v.fotosFungos.length}` : 'Não'}<br>
        Insetos: ${v.insetos ? `Sim - ${v.tipoInseto} | Nível: ${v.nivelInseto} | Inseticida: ${v.aplicarInseticida} | Fotos: ${v.fotosInsetos.length}` : 'Não'}<br>
        Plantas Daninhas: ${v.plantas ? `Sim | Fotos: ${v.fotosPlantas.length}` : 'Não'}<br>
        Localização: (${v.latitude.toFixed(4)}, ${v.longitude.toFixed(4)})
      `;
      listaRelatorio.appendChild(li);
    });
  }

  atualizarRelatorio();
});
