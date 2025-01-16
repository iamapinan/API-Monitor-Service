# คู่มือการตั้งค่า Endpoints

## 📋 สารบัญ
- [โครงสร้างพื้นฐาน](#โครงสร้างพื้นฐาน)
- [การตั้งค่า Endpoint](#การตั้งค่า-endpoint)
- [ตัวอย่างการใช้งาน](#ตัวอย่างการใช้งาน)
- [คำแนะนำและข้อควรระวัง](#คำแนะนำและข้อควรระวัง)

## 🏗️ โครงสร้างพื้นฐาน

ไฟล์ `config/endpoints.json` มีโครงสร้างดังนี้:
```json
{
  "endpoints": [
    {
      "name": "API Name",
      "url": "https://api.example.com",
      "method": "GET",
      "schedule": "30s",
      ...
    }
  ]
}
```

## ⚙️ การตั้งค่า Endpoint

### พารามิเตอร์หลัก
| พารามิเตอร์ | ประเภท | คำอธิบาย | ตัวอย่าง |
|------------|--------|----------|----------|
| name | string | ชื่อของ endpoint (ต้องไม่ซ้ำ) | "User API" |
| url | string | URL ของ API | "https://api.example.com" |
| method | string | HTTP Method | "GET", "POST", "PUT", "DELETE" |
| schedule | string | ความถี่ในการเช็ค | "30s", "1m", "1h" |
| expectedStatus | number | HTTP status ที่คาดหวัง | 200, 201 |

### Headers
```json
"headers": {
  "Authorization": "Bearer ${API_TOKEN}",
  "Content-Type": "application/json"
}
```

### Input Parameters
```json
"input": {
  "body": {
  // สำหรับ POST, PUT requests
  },
  "params": {
  // query parameters
  }
}
```

### Validation
```json
"validation": {
  "responseTime": 5000,
  "schema": {
  // response validation schema
  }
}
```

## 📝 ตัวอย่างการใช้งาน

### 1. GET Request
```json
{
  "name": "Health Check API",
  "url": "https://api.example.com/health",
  "method": "GET",
  "schedule": "30s",
  "expectedStatus": 200,
  "validation": {
  "responseTime": 3000,
    "schema": {
      "status": {
      "required": true,
      "type": "string"
      }
    }
  }
}
```

### 2. POST Request with Authentication
```json
{
  "name": "Create User",
  "url": "https://api.example.com/users",
  "method": "POST",
  "schedule": "1m",
  "expectedStatus": 201,
  "headers": {
  "Authorization": "Bearer ${API_TOKEN}",
  "Content-Type": "application/json"
},
  "input": {
    "body": {
      "username": "test",
      "email": "test@example.com"
    }
  }
}
```

## ⏱️ การกำหนดเวลา Schedule
| รูปแบบ | คำอธิบาย |
|--------|----------|
| 30s | ทุก 30 วินาที |
| 1m | ทุก 1 นาที |
| 5m | ทุก 5 นาที |
| 1h | ทุก 1 ชั่วโมง |
| 1d | ทุก 1 วัน |

## 🔍 Schema Validation
การตรวจสอบ response ด้วย schema:
```json
"schema": {
  "propertyName": {
  "required": true,
  "type": "string|number|boolean|object|array"
  }
}
```

## ⚠️ คำแนะนำและข้อควรระวัง

### การตั้งค่า Environment Variables
1. สร้างไฟล์ `.env` จาก `.env-example`
2. กำหนดค่า variables ที่จำเป็น เช่น API_TOKEN

### ข้อควรระวัง
- ตรวจสอบ JSON format ให้ถูกต้อง
- หลีกเลี่ยงการตั้ง schedule ที่ถี่เกินไป
- ระวังการเปิดเผยข้อมูลที่สำคัญใน input parameters
- ตรวจสอบ URL ให้ถูกต้องและมี protocol (http/https)

### Best Practices
1. ตั้งชื่อ endpoint ให้สื่อความหมาย
2. กำหนด timeout และ responseTime ให้เหมาะสม
3. ใช้ schema validation เพื่อตรวจสอบ response
4. เก็บ sensitive data ไว้ใน environment variables

## 📊 Logging
- ข้อมูล monitoring จะถูกเก็บที่ `logs/monitor_logs.json`
- ข้อผิดพลาดจะถูกเก็บที่ `logs/error_logs.json`

## 🔄 การอัพเดท Configuration
1. แก้ไขไฟล์ `config/endpoints.json`
2. ตรวจสอบ JSON format
3. รีสตาร์ทแอพพลิเคชัน
4. ตรวจสอบ logs เพื่อยืนยันการทำงาน

## 🛠️ การทดสอบ
1. ทดสอบการเชื่อมต่อกับ API
2. ตรวจสอบ response time
3. ยืนยัน schema validation
4. ตรวจสอบ logs

## 📚 เอกสารอ้างอิง
- [JSON Schema Documentation](https://json-schema.org/)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [RESTful API Guidelines](https://restfulapi.net/)
