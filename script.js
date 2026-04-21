const canvas = document.getElementById('posterCanvas');
const ctx = canvas.getContext('2d');

const bgColorInput = document.getElementById('bgColor');
const textInput = document.getElementById('textInput');
const addTextBtn = document.getElementById('addTextBtn');
const imageUpload = document.getElementById('imageUpload');
const layerList = document.getElementById('layerList');
const exportBtn = document.getElementById('exportBtn');

const state = {
  background: '#ffffff',
  layers: [],
  activeId: null,
};

function uid() {
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function addTextLayer(text) {
  state.layers.push({
    id: uid(),
    type: 'text',
    name: `文字：${text.slice(0, 8) || '未命名'}`,
    text,
    x: canvas.width / 2,
    y: canvas.height / 2,
    color: '#111827',
    font: 'bold 64px sans-serif',
    align: 'center',
  });
  render();
}

function addImageLayer(image) {
  const maxWidth = canvas.width * 0.8;
  const scale = Math.min(1, maxWidth / image.width);
  const width = image.width * scale;
  const height = image.height * scale;

  state.layers.push({
    id: uid(),
    type: 'image',
    name: `图片：${image.width}×${image.height}`,
    image,
    x: (canvas.width - width) / 2,
    y: (canvas.height - height) / 2,
    width,
    height,
  });
  render();
}

function moveLayer(index, direction) {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= state.layers.length) {
    return;
  }
  const [layer] = state.layers.splice(index, 1);
  state.layers.splice(targetIndex, 0, layer);
  render();
}

function removeLayer(index) {
  state.layers.splice(index, 1);
  render();
}

function renderLayerPanel() {
  layerList.innerHTML = '';
  const ordered = [...state.layers].map((layer, index) => ({ layer, index })).reverse();

  ordered.forEach(({ layer, index }) => {
    const li = document.createElement('li');
    li.className = `layer-item ${state.activeId === layer.id ? 'active' : ''}`;

    const title = document.createElement('button');
    title.textContent = layer.name;
    title.type = 'button';
    title.addEventListener('click', () => {
      state.activeId = layer.id;
      render();
    });

    const actions = document.createElement('div');
    actions.className = 'layer-actions';

    const upBtn = document.createElement('button');
    upBtn.textContent = '上移';
    upBtn.type = 'button';
    upBtn.addEventListener('click', () => moveLayer(index, 1));

    const downBtn = document.createElement('button');
    downBtn.textContent = '下移';
    downBtn.type = 'button';
    downBtn.addEventListener('click', () => moveLayer(index, -1));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '删除';
    deleteBtn.type = 'button';
    deleteBtn.addEventListener('click', () => removeLayer(index));

    actions.append(upBtn, downBtn, deleteBtn);
    li.append(title, actions);
    layerList.append(li);
  });
}

function drawCanvas() {
  ctx.fillStyle = state.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  state.layers.forEach((layer) => {
    if (layer.type === 'text') {
      ctx.font = layer.font;
      ctx.fillStyle = layer.color;
      ctx.textAlign = layer.align;
      ctx.textBaseline = 'middle';
      ctx.fillText(layer.text, layer.x, layer.y);
    }

    if (layer.type === 'image') {
      ctx.drawImage(layer.image, layer.x, layer.y, layer.width, layer.height);
    }
  });
}

function render() {
  drawCanvas();
  renderLayerPanel();
}

bgColorInput.addEventListener('input', (event) => {
  state.background = event.target.value;
  render();
});

addTextBtn.addEventListener('click', () => {
  const text = textInput.value.trim();
  if (!text) {
    textInput.focus();
    return;
  }
  addTextLayer(text);
  textInput.value = '';
});

imageUpload.addEventListener('change', (event) => {
  const [file] = event.target.files;
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      addImageLayer(image);
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);

  event.target.value = '';
});

exportBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = `poster-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
});

render();
