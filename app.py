from flask import Flask, request, jsonify, send_file
from werkzeug.utils import secure_filename
import os
from pydub import AudioSegment
from PIL import Image
import magic
from flask_cors import CORS
import io

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Upload klasörünü oluştur
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

ALLOWED_AUDIO_FORMATS = ['mp3', 'wav', 'ogg', 'm4a']
ALLOWED_IMAGE_FORMATS = ['jpg', 'png', 'gif', 'bmp']

def allowed_file(filename, file_type):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_AUDIO_FORMATS if file_type == 'audio' else filename.rsplit('.', 1)[1].lower() in ALLOWED_IMAGE_FORMATS if file_type == 'image' else False

def get_file_type(file_path):
    mime = magic.Magic(mime=True)
    file_mime = mime.from_file(file_path)
    if file_mime.startswith('audio/'):
        return 'audio'
    elif file_mime.startswith('image/'):
        return 'image'
    return None

@app.route('/convert', methods=['POST'])
def convert_file():
    if 'file' not in request.files:
        return jsonify({'error': 'Dosya yüklenmedi'}), 400
    
    file = request.files['file']
    target_format = request.form.get('target_format')
    
    if file.filename == '':
        return jsonify({'error': 'Dosya seçilmedi'}), 400
    
    if not target_format:
        return jsonify({'error': 'Hedef format belirtilmedi'}), 400
    
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)
    
    file_type = get_file_type(file_path)
    if not file_type:
        return jsonify({'error': 'Desteklenmeyen dosya formatı'}), 400
    
    if not allowed_file(filename, file_type):
        return jsonify({'error': 'Desteklenmeyen dosya formatı'}), 400
    
    try:
        output_filename = f"converted_{os.path.splitext(filename)[0]}.{target_format}"
        output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
        
        if file_type == 'audio':
            audio = AudioSegment.from_file(file_path)
            audio.export(output_path, format=target_format)
        elif file_type == 'image':
            img = Image.open(file_path)
            if img.mode in ('RGBA', 'LA'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[-1])
                img = background
            img.save(output_path, format=target_format.upper())
        
        return send_file(output_path, as_attachment=True)
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    finally:
        # Geçici dosyaları temizle
        if os.path.exists(file_path):
            os.remove(file_path)
        if os.path.exists(output_path):
            os.remove(output_path)

@app.route('/supported-formats', methods=['GET'])
def get_supported_formats():
    return jsonify({'audio': ALLOWED_AUDIO_FORMATS, 'image': ALLOWED_IMAGE_FORMATS})

if __name__ == '__main__':
    app.run(debug=True) 