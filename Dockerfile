FROM python:3.14.4-alpine3.22

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ app/
COPY wsgi.py .

RUN mkdir -p data

EXPOSE 8080

CMD ["python", "wsgi.py"]
