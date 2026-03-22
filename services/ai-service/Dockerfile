# Stage 1: Dependency and Model Builder
FROM python:3.9-slim as builder

WORKDIR /build

COPY requirements.txt .

# Install CPU version of torch specifically to save memory and space
RUN pip install --no-cache-dir "torch>=2.6.0" --extra-index-url https://download.pytorch.org/whl/cpu

# Install remaining dependencies, filtering out torch to avoid conflicts
RUN grep -v "torch" requirements.txt > requirements-docker.txt && \
    pip install --no-cache-dir -r requirements-docker.txt && \
    rm requirements-docker.txt

# Download models into the builder stage (DISABLED for build-time stability)
# If your machine has more resources, you can un-comment these to pre-load models into the image.
# COPY text_classifier.py audio_classifier.py image_classifier.py ./
# RUN python -c "from text_classifier import load_text_model; load_text_model()" && \
#     python -c "from audio_classifier import load_audio_model; load_audio_model()" && \
#     python -c "from image_classifier import load_image_model; load_image_model()"

# Stage 2: Final Runtime Image
FROM python:3.9-slim

# Install system dependencies required for runtime
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsm6 \
    libxext6 \
    git \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy installed python packages from builder
COPY --from=builder /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy pre-downloaded model caches from builder (if un-commented above)
COPY --from=builder /root/.cache /root/.cache

# Copy application source code
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
