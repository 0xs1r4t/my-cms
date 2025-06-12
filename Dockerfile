FROM python:3.13.4-slim-bookworm

WORKDIR /app

COPY requirements.txt .

# Install pip dependencies
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--bind", "::"]