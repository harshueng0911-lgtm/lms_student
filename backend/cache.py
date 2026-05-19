CACHE = {}

def get_cached_data(assessment_id):
    return CACHE.get(assessment_id)

def set_cache(assessment_id, data):
    CACHE[assessment_id] = data