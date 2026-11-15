FROM python:3.12-slim
RUN apt-get update && apt-get install -y --no-install-recommends sumo sumo-tools && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY server/requirements.txt /app/server/requirements.txt
RUN pip install --no-cache-dir -r /app/server/requirements.txt
COPY . /app
ENV PORT=8888 PYTHONUNBUFFERED=1
EXPOSE 8888
CMD ["python","server/app.py"]
