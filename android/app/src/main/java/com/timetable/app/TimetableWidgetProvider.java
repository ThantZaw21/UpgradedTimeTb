package com.timetable.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

import org.json.JSONObject;

public class TimetableWidgetProvider extends AppWidgetProvider {
    private static final String PREFS_NAME = "CapacitorStorage";
    private static final String PAYLOAD_KEY = "home_widget_payload";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (AppWidgetManager.ACTION_APPWIDGET_UPDATE.equals(intent.getAction())) {
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ComponentName provider = new ComponentName(context, TimetableWidgetProvider.class);
            int[] widgetIds = appWidgetManager.getAppWidgetIds(provider);
            onUpdate(context, appWidgetManager, widgetIds);
        }
    }

    private static void updateWidget(Context context, AppWidgetManager appWidgetManager, int widgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_timetable);

        String day = "Today";
        String current = "Open app to sync";
        String next = "Add widget data";
        String status = "No data yet";

        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            String payload = prefs.getString(PAYLOAD_KEY, null);
            if (payload != null && !payload.isEmpty()) {
                JSONObject object = new JSONObject(payload);
                day = object.optString("day", day);
                current = object.optString("currentSub", current);
                next = object.optString("nextSub", next);
                status = object.optString("status", status);
            }
        } catch (Exception ignored) {
            // Fall back to defaults when payload parsing fails.
        }

        views.setTextViewText(R.id.widget_day, day);
        views.setTextViewText(R.id.widget_current_subject, current);
        views.setTextViewText(R.id.widget_next_subject, next);
        views.setTextViewText(R.id.widget_status, status);

        appWidgetManager.updateAppWidget(widgetId, views);
    }
}
