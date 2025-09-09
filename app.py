from flask import Flask, request, jsonify, render_template
import numpy as np
import tensorflow as tf
import joblib # Thư viện để tải scaler

# --- KHỞI TẠO ỨNG DỤNG VÀ TẢI MODEL, SCALER ---
app = Flask(__name__)

try:
    # Tải model đã huấn luyện
    model = tf.keras.models.load_model('insurance_model_finetuned.h5')
    # Tải scaler đã lưu
    scaler = joblib.load('scaler.pkl')
    print("Model và scaler đã được tải thành công!")
except Exception as e:
    print(f"*** Lỗi khi tải model hoặc scaler: {e}")
    model = None
    scaler = None

# --- ROUTE HIỂN THỊ GIAO DIỆN ---
@app.route('/')
def home():
    return render_template('index.html')

# --- ROUTE API ĐỂ DỰ ĐOÁN ---
@app.route('/predict', methods=['POST'])
def predict():
    if model is None or scaler is None:
        return jsonify({'error': 'Model hoặc Scaler không khả dụng.'})

    try:
        # 1. Lấy dữ liệu JSON từ frontend
        data = request.get_json(force=True)

        # 2. Chuyển đổi dữ liệu chữ thành số (Mô phỏng LabelEncoder)
        # Các giá trị này phải khớp với cách LabelEncoder đã mã hóa
        # LabelEncoder mã hóa theo thứ tự alphabet
        sex_map = {'female': 0, 'male': 1}
        smoker_map = {'no': 0, 'yes': 1}
        region_map = {'northeast': 0, 'northwest': 1, 'southeast': 2, 'southwest': 3}

        sex = sex_map[data['sex']]
        smoker = smoker_map[data['smoker']]
        region = region_map[data['region']]
        
        # Lấy các giá trị số
        age = float(data['age'])
        bmi = float(data['bmi'])
        children = int(data['children'])

        # 3. Tạo input array với ĐÚNG THỨ TỰ như khi huấn luyện
        # Thứ tự trong train.py: ["age", "sex", "bmi", "children", "smoker", "region"]
        features = np.array([[
            age,
            sex,
            bmi,
            children,
            smoker,
            region
        ]]) # Shape (1, 6)

        # 4. Scale dữ liệu bằng scaler đã tải
        scaled_features = scaler.transform(features)

        # 5. Dự đoán
        prediction = model.predict(scaled_features)
        predicted_charge = prediction[0][0]
        
        # Trả kết quả về cho frontend
        return jsonify({'prediction_text': f'${predicted_charge:,.2f}'})

    except Exception as e:
        return jsonify({'error': f'Lỗi xử lý: {str(e)}'})

# --- CHẠY ỨNG DỤNG ---
if __name__ == '__main__':
    app.run(debug=True)