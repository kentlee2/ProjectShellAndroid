package com.royal.projectshellandroid.util;


import com.google.gson.Gson;
import com.google.gson.internal.$Gson$Types;
import com.google.gson.stream.JsonReader;
import com.lzy.okgo.callback.AbsCallback;
import com.lzy.okgo.model.Response;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;

import okhttp3.ResponseBody;



public abstract class JsonCallback<T> extends AbsCallback<T> {


    @Override
    public void onSuccess(Response<T> response) {

    }

    @Override
    public T convertResponse(okhttp3.Response response) throws Throwable {
        ResponseBody body = response.body();
        if(body==null) return null;
        Gson gson = new Gson();
        JsonReader reader = new JsonReader(body.charStream());
        Type mType = getSuperclassTypeParameter(getClass());
        T data = gson.fromJson(reader, mType);
        return data;
    }
    /**
     * 得到泛型T的实际Type
     */
    static Type getSuperclassTypeParameter(Class<?> subclass) {
        Type superclass = subclass.getGenericSuperclass();
        if (superclass instanceof Class) {
            throw new RuntimeException("Missing type parameter.");
        }
        ParameterizedType parameterized = (ParameterizedType) superclass;
        return $Gson$Types.canonicalize(parameterized.getActualTypeArguments()[0]);
    }
}
